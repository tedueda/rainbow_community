from fastapi import FastAPI, Depends
from sqlalchemy import text
from .database import get_db
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, profiles, posts, comments, reactions, follows, notifications
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LGBTQ Community API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(reactions.router)
app.include_router(follows.router)
app.include_router(notifications.router)

@app.get("/healthz")
async def healthz():
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
