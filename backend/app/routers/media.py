from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MediaAsset
from app.auth import get_current_active_user
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/media", tags=["media"])

MEDIA_DIR = Path("/home/ubuntu/lgbtq_community/backend/media")
MEDIA_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    
    file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = MEDIA_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    media_asset = MediaAsset(
        user_id=current_user.id,
        url=f"/media/{unique_filename}",
        mime_type=file.content_type,
        size_bytes=len(content)
    )
    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)
    
    return {"id": media_asset.id, "url": media_asset.url}
