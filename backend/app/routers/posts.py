from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models import User, Post, PointEvent
from app.schemas import Post as PostSchema, PostCreate, PostUpdate
from app.auth import get_current_active_user, get_current_premium_user

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/", response_model=List[PostSchema])
async def read_posts(
    skip: int = 0,
    limit: int = 20,
    visibility: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Post).order_by(desc(Post.created_at))
    
    if visibility:
        query = query.filter(Post.visibility == visibility)
    else:
        query = query.filter(Post.visibility == "public")
    
    posts = query.offset(skip).limit(limit).all()
    return posts

@router.post("/", response_model=PostSchema)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_premium_user),
    db: Session = Depends(get_db)
):
    db_post = Post(**post.dict(), user_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
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
    current_user: User = Depends(get_current_premium_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for field, value in post_update.dict(exclude_unset=True).items():
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_premium_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}
