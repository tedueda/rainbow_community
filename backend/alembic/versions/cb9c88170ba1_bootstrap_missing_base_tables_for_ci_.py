"""bootstrap missing base tables for CI (media_assets)

Revision ID: cb9c88170ba1
Revises: 68253ac0121c
Create Date: 2025-10-11 06:52:18.994273

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = 'cb9c88170ba1'
down_revision = '68253ac0121c'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    
    if "media_assets" not in inspector.get_table_names():
        op.create_table(
            "media_assets",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
            sa.Column("url", sa.String(500), nullable=False),
            sa.Column("mime_type", sa.String(100), nullable=False),
            sa.Column("size_bytes", sa.BigInteger, nullable=True),
            sa.Column("width", sa.Integer, nullable=True),
            sa.Column("height", sa.Integer, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        )
        
        existing_indexes = {ix["name"] for ix in inspector.get_indexes("media_assets")}
        if "ix_media_assets_id" not in existing_indexes:
            op.create_index("ix_media_assets_id", "media_assets", ["id"], unique=False)


def downgrade():
    pass
