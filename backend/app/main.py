from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from .database import get_db
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import auth, users, profiles, posts, comments, reactions, follows, notifications, media, billing, matching, categories
from app.database import Base, engine
import os
from pathlib import Path
import os

PORT = int(os.getenv("PORT", 8000))

app = FastAPI(title="LGBTQ Community API", version="1.0.0")

media_base = os.getenv("MEDIA_DIR")
if not media_base:
    media_base = "/data/media" if os.path.exists("/data") else "media"
MEDIA_DIR = Path(media_base)
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins_env = os.getenv("ALLOW_ORIGINS", "")
if origins_env:
    ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure 307 redirect between with/without trailing slash
app.router.redirect_slashes = True

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(reactions.router)
app.include_router(follows.router)
app.include_router(notifications.router)
app.include_router(media.router)
app.include_router(billing.router)
app.include_router(matching.router)
app.include_router(categories.router)

@app.on_event("startup")
def on_startup():
    db_url = os.getenv("DATABASE_URL", "")
    if "sqlite" in db_url.lower() or not db_url:
        Base.metadata.create_all(bind=engine)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.head("/healthz")
async def healthz_head():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "LGBTQ Community API", "version": "1.0.0"}


@app.get("/api/health")
def health(db=Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "ok"}


@app.get("/api/categories/{name}/posts")
def posts_by_category(name: str, limit: int = 20, offset: int = 0, db=Depends(get_db)):
    sql = text("""
        SELECT id, title, body, created_at
        FROM public.v_posts_by_tag
        WHERE tag = :name
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    rows = db.execute(sql, {"name": name, "limit": limit, "offset": offset}).mappings().all()
    return {"items": rows, "count": len(rows)}
