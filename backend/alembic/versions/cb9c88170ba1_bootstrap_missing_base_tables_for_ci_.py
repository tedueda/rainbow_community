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
    
    if "users" not in inspector.get_table_names():
        op.create_table(
            "users",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("email", sa.String, nullable=False),
            sa.Column("password_hash", sa.String, nullable=False),
            sa.Column("display_name", sa.String(100), nullable=False),
            sa.Column("membership_type", sa.String(20), server_default="premium"),
            sa.Column("is_active", sa.Boolean, server_default="true"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        )
        op.execute("ALTER TABLE users ADD CONSTRAINT check_membership_type CHECK (membership_type IN ('free', 'premium', 'admin'))")
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_users_id ON users (id)")
    
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
        op.execute("CREATE INDEX IF NOT EXISTS ix_media_assets_id ON media_assets (id)")
    
    # Create posts table (depends on users and media_assets)
    if "posts" not in inspector.get_table_names():
        op.create_table(
            "posts",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
            sa.Column("title", sa.String(200), nullable=True),
            sa.Column("body", sa.Text, nullable=False),
            sa.Column("visibility", sa.String(20), server_default="public"),
            sa.Column("youtube_url", sa.String(500), nullable=True),
            sa.Column("media_id", sa.Integer, sa.ForeignKey("media_assets.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        )
        op.execute("ALTER TABLE posts ADD CONSTRAINT check_post_visibility CHECK (visibility IN ('public', 'members', 'followers', 'private'))")
        op.execute("CREATE INDEX IF NOT EXISTS ix_posts_id ON posts (id)")


def downgrade():
    pass
