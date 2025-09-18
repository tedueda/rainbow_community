from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Post, PointEvent, Reaction
from app.schemas import Post as PostSchema, PostCreate, PostUpdate
from app.auth import get_current_active_user, get_current_premium_user, get_current_user_optional

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/", response_model=List[PostSchema])
async def read_posts(
    skip: int = 0,
    limit: int = 20,
    visibility: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest"),
    range: Optional[str] = Query("all"),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    
    if visibility:
        query = query.filter(Post.visibility == visibility)
    else:
        query = query.filter(Post.visibility == "public")
    
    if category:
        query = query.filter(Post.body.contains(f"#{category}"))
    
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
    
    posts = query.offset(skip).limit(limit).all()
    return posts

@router.post("/", response_model=PostSchema)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    
    db_post = Post(**post.dict(), user_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    if current_user:
        point_event = PointEvent(
            user_id=current_user.id,
            event_type="post_created",
            points=10,
            ref_type="post",
            ref_id=db_post.id
        )
        db.add(point_event)
        db.commit()
    
    return db_post

@router.get("/{post_id}", response_model=PostSchema)
async def read_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/{post_id}", response_model=PostSchema)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # if current_user and post.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for field, value in post_update.dict(exclude_unset=True).items():
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # if current_user and post.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}

@router.post("/{post_id}/like")
async def toggle_like_post(
    post_id: int,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_id = current_user.id if current_user else 1
    
    existing_reaction = db.query(Reaction).filter(
        Reaction.user_id == user_id,
        Reaction.target_type == "post",
        Reaction.target_id == post_id,
        Reaction.reaction_type == "like"
    ).first()
    
    if existing_reaction:
        db.delete(existing_reaction)
        db.commit()
        return {"liked": False, "like_count": 0}
    else:
        new_reaction = Reaction(
            user_id=user_id,
            target_type="post",
            target_id=post_id,
            reaction_type="like"
        )
        db.add(new_reaction)
        db.commit()
        return {"liked": True, "like_count": 1}

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
