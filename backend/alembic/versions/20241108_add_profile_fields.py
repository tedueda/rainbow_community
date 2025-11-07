"""add profile fields

Revision ID: 20241108_0001
Revises: 68253ac0121c
Create Date: 2024-11-08 07:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20241108_0001'
down_revision = '68253ac0121c'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to matching_profiles table
    op.add_column('matching_profiles', sa.Column('nickname', sa.String(length=100), nullable=True))
    op.add_column('matching_profiles', sa.Column('residence_detail', sa.String(length=100), nullable=True))
    op.add_column('matching_profiles', sa.Column('hometown', sa.String(length=100), nullable=True))
    op.add_column('matching_profiles', sa.Column('blood_type', sa.String(length=20), nullable=True))
    op.add_column('matching_profiles', sa.Column('zodiac', sa.String(length=20), nullable=True))


def downgrade():
    # Remove columns from matching_profiles table
    op.drop_column('matching_profiles', 'zodiac')
    op.drop_column('matching_profiles', 'blood_type')
    op.drop_column('matching_profiles', 'hometown')
    op.drop_column('matching_profiles', 'residence_detail')
    op.drop_column('matching_profiles', 'nickname')
