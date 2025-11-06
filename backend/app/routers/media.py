from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MediaAsset
from app.auth import get_current_active_user
import os
import uuid
from pathlib import Path
import os

router = APIRouter(prefix="/api/media", tags=["media"])

media_base = os.getenv("MEDIA_DIR")
if not media_base:
    media_base = "/data/media" if os.path.exists("/data") else "media"
MEDIA_DIR = Path(media_base)
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Validate content type defensively (content_type can be None)
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = MEDIA_DIR / unique_filename

    # Stream file to disk in chunks to avoid loading entire file into memory
    max_bytes = 10 * 1024 * 1024  # 10MB
    total_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(chunk_size):
                total_size += len(chunk)
                if total_size > max_bytes:
                    # Clean up partial file
                    buffer.close()
                    file_path.unlink(missing_ok=True)
                    raise HTTPException(status_code=400, detail="File too large")
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on any error
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    media_asset = MediaAsset(
        user_id=current_user.id,
        url=f"/media/{unique_filename}",
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=total_size
    )
    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)
    
    return {"id": media_asset.id, "url": media_asset.url}
