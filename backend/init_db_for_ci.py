"""Initialize database tables for CI testing.

This script creates all tables from SQLAlchemy models before running Alembic migrations.
This is needed because the existing migrations assume tables already exist.
"""
from app.database import Base, engine

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created from models")
