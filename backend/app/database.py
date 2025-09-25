from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# .env は補完用途として読み込み、既存の環境変数は上書きしない
# これにより、CLI で与えた DATABASE_URL が .env によって潰されない
load_dotenv(override=False)

DATABASE_URL = os.getenv("DATABASE_URL")
# README: ローカル開発では SQLite フォールバックを使用
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./lgbtq_community.db"

print(f"🔄 Using database: {DATABASE_URL}")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
