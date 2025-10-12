"""add_category_subcategory_and_blog_fields_to_posts

Revision ID: 7bb188854c12
Revises: 5d536f3622f2
Create Date: 2025-10-12 05:27:59.637331

"""
from alembic import op
import sqlalchemy as sa


revision = '7bb188854c12'
down_revision = '5d536f3622f2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('posts', sa.Column('category', sa.String(50), nullable=True))
    op.add_column('posts', sa.Column('subcategory', sa.String(100), nullable=True))
    op.add_column('posts', sa.Column('post_type', sa.String(20), server_default='post', nullable=False))
    op.add_column('posts', sa.Column('slug', sa.String(200), nullable=True))
    op.add_column('posts', sa.Column('status', sa.String(20), server_default='published', nullable=False))
    op.add_column('posts', sa.Column('og_image_url', sa.String(500), nullable=True))
    op.add_column('posts', sa.Column('excerpt', sa.Text, nullable=True))
    
    op.create_check_constraint('check_post_type', 'posts', "post_type IN ('post', 'blog', 'tourism')")
    op.create_check_constraint('check_post_status', 'posts', "status IN ('draft', 'published')")
    
    op.create_index('ix_posts_slug', 'posts', ['slug'], unique=True)
    
    op.create_table(
        'posts_tourism',
        sa.Column('post_id', sa.Integer, sa.ForeignKey('posts.id'), primary_key=True),
        sa.Column('prefecture', sa.String(50), nullable=True),
        sa.Column('event_datetime', sa.DateTime(timezone=True), nullable=True),
        sa.Column('meet_place', sa.String(200), nullable=True),
        sa.Column('meet_address', sa.String(500), nullable=True),
        sa.Column('tour_content', sa.Text, nullable=True),
        sa.Column('fee', sa.Integer, nullable=True),
        sa.Column('contact_phone', sa.String(20), nullable=True),
        sa.Column('contact_email', sa.String(200), nullable=True),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('attachment_pdf_url', sa.String(500), nullable=True)
    )


def downgrade():
    op.drop_table('posts_tourism')
    
    op.drop_index('ix_posts_slug', table_name='posts')
    
    op.drop_constraint('check_post_status', 'posts', type_='check')
    op.drop_constraint('check_post_type', 'posts', type_='check')
    
    op.drop_column('posts', 'excerpt')
    op.drop_column('posts', 'og_image_url')
    op.drop_column('posts', 'status')
    op.drop_column('posts', 'slug')
    op.drop_column('posts', 'post_type')
    op.drop_column('posts', 'subcategory')
    op.drop_column('posts', 'category')
