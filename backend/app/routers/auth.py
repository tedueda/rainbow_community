from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile
from app.schemas import UserCreate, User as UserSchema, Token
from app.auth import authenticate_user, create_access_token, get_password_hash, get_current_active_user, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.get("/health")
async def auth_health():
    """Health check endpoint for authentication service - no authentication required"""
    return {"status": "ok", "service": "authentication"}

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        display_name=user.display_name,
        membership_type="premium"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    db_profile = Profile(
        user_id=db_user.id,
        handle=f"user_{db_user.id}"
    )
    db.add(db_profile)
    db.commit()
    
    return db_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/admin/users", response_model=List[UserSchema])
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return users

@router.get("/admin/posts")
async def get_all_posts(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    from app.models import Post
    posts = db.query(Post).all()
    return posts
