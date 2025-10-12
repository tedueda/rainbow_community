from fastapi import APIRouter, Depends, HTTPException, Query, Request
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import html
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Post, PointEvent, Reaction, Tag, PostTag, MediaAsset, PostMedia, PostTourism
from app.schemas import Post as PostSchema, PostCreate, PostUpdate
import re
from app.auth import get_current_active_user, get_current_premium_user

router = APIRouter(prefix="/api/posts", tags=["posts"], redirect_slashes=False)

limiter = Limiter(key_func=get_remote_address)


@router.get("", response_model=List[PostSchema])
@router.get("/", response_model=List[PostSchema])
async def read_posts(
    page: int = 1,
    limit: int = 20,
    visibility: Optional[str] = None,
    category: Optional[str] = None,
    category_id: Optional[str] = None,
    sort: str = "newest",
    range: str = "all",
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    
    if visibility:
        query = query.filter(Post.visibility == visibility)
    else:
        query = query.filter(Post.visibility == "public")
    
    # Support category via name or category_id (mapped to hashtag)
    cat_value = category
    if category_id and not cat_value:
        cat_value = category_id
    if cat_value:
        category_map = {
            "board": "board",
            "art": "art", 
            "music": "music",
            "shops": "shops",
            "tours": "tours",
            "comics": "comics"
        }
        hashtag = category_map.get(cat_value, cat_value)
        query = query.filter(Post.body.contains(f"#{hashtag}"))
    
    if range != "all":
        now = datetime.utcnow()
        if range == "24h":
            query = query.filter(Post.created_at >= now - timedelta(hours=24))
        elif range == "7d":
            query = query.filter(Post.created_at >= now - timedelta(days=7))
        elif range == "30d":
            query = query.filter(Post.created_at >= now - timedelta(days=30))
    
    if sort == "newest":
        query = query.order_by(desc(Post.created_at))
    elif sort == "popular":
        query = query.order_by(desc(Post.created_at))
    elif sort == "comments":
        query = query.order_by(desc(Post.created_at))
    elif sort == "points":
        query = query.order_by(desc(Post.created_at))
    else:
        query = query.order_by(desc(Post.created_at))
    
    page = max(1, page)
    limit = max(1, min(100, limit))
    offset = (page - 1) * limit
    posts = query.offset(offset).limit(limit).all()
    
    result = []
    for post in posts:
        post_dict = {
            "id": post.id,
            "user_id": post.user_id,
            "user_display_name": post.user.display_name if getattr(post, "user", None) else None,
            "title": post.title,
            "body": post.body,
            "visibility": post.visibility,
            "youtube_url": post.youtube_url,
            "media_id": post.media_id,
            "media_url": None,
            "media_urls": [],
            "category": post.category,
            "subcategory": post.subcategory,
            "post_type": post.post_type,
            "slug": post.slug,
            "status": post.status,
            "og_image_url": post.og_image_url,
            "excerpt": post.excerpt,
            "tourism_details": None,
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
        if post.media_id:
            media = db.query(MediaAsset).filter(MediaAsset.id == post.media_id).first()
            if media:
                post_dict["media_url"] = media.url
        
        post_media_records = db.query(PostMedia).filter(PostMedia.post_id == post.id).order_by(PostMedia.order_index).all()
        if post_media_records:
            media_urls = []
            for pm in post_media_records:
                media = db.query(MediaAsset).filter(MediaAsset.id == pm.media_asset_id).first()
                if media:
                    media_urls.append(media.url)
            post_dict["media_urls"] = media_urls
        
        if post.post_type == 'tourism':
            tourism = db.query(PostTourism).filter(PostTourism.post_id == post.id).first()
            if tourism:
                post_dict["tourism_details"] = {
                    "prefecture": tourism.prefecture,
                    "event_datetime": tourism.event_datetime,
                    "meet_place": tourism.meet_place,
                    "meet_address": tourism.meet_address,
                    "tour_content": tourism.tour_content,
                    "fee": tourism.fee,
                    "contact_phone": tourism.contact_phone,
                    "contact_email": tourism.contact_email,
                    "deadline": tourism.deadline,
                    "attachment_pdf_url": tourism.attachment_pdf_url
                }
        
        result.append(post_dict)
    
    return result

@router.post("", response_model=PostSchema)
@router.post("/", response_model=PostSchema)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    post_data = post.dict(exclude={'media_ids', 'tourism_details'})
    
    if post.post_type == 'blog' and not post.slug and post.title:
        base_slug = re.sub(r'[^\w\s-]', '', post.title.lower())
        base_slug = re.sub(r'[-\s]+', '-', base_slug).strip('-')
        slug = base_slug
        counter = 1
        while db.query(Post).filter(Post.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        post_data['slug'] = slug
    
    db_post = Post(**post_data, user_id=current_user.id)
    db.add(db_post)
    db.flush()
    
    if post.media_ids:
        for idx, media_id in enumerate(post.media_ids[:5]):
            post_media = PostMedia(
                post_id=db_post.id,
                media_asset_id=media_id,
                order_index=idx
            )
            db.add(post_media)
    
    if post.post_type == 'tourism' and post.tourism_details:
        tourism_data = post.tourism_details.dict()
        db_tourism = PostTourism(post_id=db_post.id, **tourism_data)
        db.add(db_tourism)
    
    point_event = PointEvent(
        user_id=current_user.id,
        event_type="post_created",
        points=10,
        ref_type="post",
        ref_id=db_post.id
    )
    db.add(point_event)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/{post_id}", response_model=PostSchema)
async def read_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post_dict = {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "body": post.body,
        "visibility": post.visibility,
        "youtube_url": post.youtube_url,
        "media_id": post.media_id,
        "media_url": None,
        "media_urls": [],
        "category": post.category,
        "subcategory": post.subcategory,
        "post_type": post.post_type,
        "slug": post.slug,
        "status": post.status,
        "og_image_url": post.og_image_url,
        "excerpt": post.excerpt,
        "tourism_details": None,
        "created_at": post.created_at,
        "updated_at": post.updated_at
    }
    if post.media_id:
        media = db.query(MediaAsset).filter(MediaAsset.id == post.media_id).first()
        if media:
            post_dict["media_url"] = media.url
    
    post_media_records = db.query(PostMedia).filter(PostMedia.post_id == post_id).order_by(PostMedia.order_index).all()
    if post_media_records:
        media_urls = []
        for pm in post_media_records:
            media = db.query(MediaAsset).filter(MediaAsset.id == pm.media_asset_id).first()
            if media:
                media_urls.append(media.url)
        post_dict["media_urls"] = media_urls
    
    if post.post_type == 'tourism':
        tourism = db.query(PostTourism).filter(PostTourism.post_id == post_id).first()
        if tourism:
            post_dict["tourism_details"] = {
                "prefecture": tourism.prefecture,
                "event_datetime": tourism.event_datetime,
                "meet_place": tourism.meet_place,
                "meet_address": tourism.meet_address,
                "tour_content": tourism.tour_content,
                "fee": tourism.fee,
                "contact_phone": tourism.contact_phone,
                "contact_email": tourism.contact_email,
                "deadline": tourism.deadline,
                "attachment_pdf_url": tourism.attachment_pdf_url
            }
    
    return post_dict

@router.put("/{post_id}", response_model=PostSchema)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = post_update.dict(exclude_unset=True, exclude={'media_ids', 'tourism_details'})
    for field, value in update_data.items():
        setattr(post, field, value)
    
    if post_update.media_ids is not None:
        db.query(PostMedia).filter(PostMedia.post_id == post_id).delete(synchronize_session=False)
        for idx, media_id in enumerate(post_update.media_ids[:5]):
            post_media = PostMedia(
                post_id=post_id,
                media_asset_id=media_id,
                order_index=idx
            )
            db.add(post_media)
    
    if post_update.tourism_details is not None:
        existing_tourism = db.query(PostTourism).filter(PostTourism.post_id == post_id).first()
        if existing_tourism:
            tourism_data = post_update.tourism_details.dict(exclude_unset=True)
            for field, value in tourism_data.items():
                setattr(existing_tourism, field, value)
        else:
            tourism_data = post_update.tourism_details.dict()
            db_tourism = PostTourism(post_id=post_id, **tourism_data)
            db.add(db_tourism)
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    logger = logging.getLogger("app.posts")
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        # Delete dependent comments, tag mappings, reactions, point events, post_media, and post_tourism to avoid FK/consistency issues
        from app.models import Comment, PostTag, Reaction, PointEvent
        db.query(Comment).filter(Comment.post_id == post_id).delete(synchronize_session=False)
        db.query(PostTag).filter(PostTag.post_id == post_id).delete(synchronize_session=False)
        db.query(Reaction).filter(Reaction.target_type == "post", Reaction.target_id == post_id).delete(synchronize_session=False)
        db.query(PointEvent).filter(PointEvent.ref_type == "post", PointEvent.ref_id == post_id).delete(synchronize_session=False)
        db.query(PostMedia).filter(PostMedia.post_id == post_id).delete(synchronize_session=False)
        db.query(PostTourism).filter(PostTourism.post_id == post_id).delete(synchronize_session=False)

        # Remember media_id to potentially cleanup
        media_id = post.media_id

        # Delete the post row via bulk delete to avoid ORM relationship side-effects
        db.query(Post).filter(Post.id == post_id).delete(synchronize_session=False)
        db.commit()

        # Cleanup orphaned media if no other posts reference it
        if media_id:
            in_use = db.query(Post).filter(Post.media_id == media_id).count()
            if in_use == 0:
                media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
                if media:
                    # attempt to remove file from disk
                    import os
                    from pathlib import Path
                    base_dir = os.getenv("MEDIA_DIR") or ("/data/media" if os.path.exists("/data") else "media")
                    try:
                        url = media.url or ""
                        rel = url.replace("/media/", "", 1)
                        path = Path(base_dir) / rel
                        if path.is_file():
                            path.unlink()
                    except Exception:
                        pass
                    db.delete(media)
                    db.commit()
        return {"message": "Post deleted successfully"}
    except HTTPException:
        # ensure transaction state is clean
        db.rollback()
        raise
    except Exception as e:
        logger.exception("Failed to delete post %s", post_id)
        db.rollback()
        # Return error with message for quick diagnosis in prod
        raise HTTPException(status_code=500, detail=f"delete_failed: {type(e).__name__}: {e}")

@router.post("/{post_id}/like")
async def toggle_like_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing_reaction = db.query(Reaction).filter(
        Reaction.user_id == current_user.id,
        Reaction.target_type == "post",
        Reaction.target_id == post_id,
        Reaction.reaction_type == "like"
    ).first()
    
    if existing_reaction:
        db.delete(existing_reaction)
        db.commit()
        like_count = db.query(Reaction).filter(
            Reaction.target_type == "post",
            Reaction.target_id == post_id,
            Reaction.reaction_type == "like"
        ).count()
        return {"liked": False, "like_count": like_count}
    else:
        new_reaction = Reaction(
            user_id=current_user.id,
            target_type="post",
            target_id=post_id,
            reaction_type="like"
        )
        db.add(new_reaction)
        db.commit()
        like_count = db.query(Reaction).filter(
            Reaction.target_type == "post",
            Reaction.target_id == post_id,
            Reaction.reaction_type == "like"
        ).count()
        return {"liked": True, "like_count": like_count}

@router.get("/{post_id}/comments")
async def get_post_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    from app.models import Comment
    comments = db.query(Comment).filter(
        Comment.post_id == post_id
    ).order_by(Comment.created_at).offset(skip).limit(limit).all()
    
    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append({
            "id": comment.id,
            "body": comment.body,
            "created_at": comment.created_at,
            "user": {
                "id": user.id,
                "display_name": user.display_name
            } if user else None
        })
    
    return result

@router.post("/{post_id}/comments")
@limiter.limit("10/5minutes")
async def create_post_comment(
    request: Request,
    post_id: int,
    comment_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    author_name = comment_data.get("authorName", "").strip()
    body = comment_data.get("body", "").strip()
    
    if not author_name or len(author_name) > 50:
        raise HTTPException(status_code=400, detail="invalid_author")
    if not body or len(body) > 1000:
        raise HTTPException(status_code=400, detail="invalid_body")
    
    safe_body = html.escape(body)
    
    post = db.query(Post).filter(Post.id == post_id, Post.visibility == "public").first()
    if not post:
        raise HTTPException(status_code=404, detail="post_not_found")
    
    from app.models import Comment
    new_comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        body=safe_body
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "author_name": current_user.display_name,
        "body": new_comment.body,
        "created_at": new_comment.created_at
    }
