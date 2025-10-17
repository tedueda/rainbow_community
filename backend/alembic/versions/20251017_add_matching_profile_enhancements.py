"""add matching profile enhancements

Revision ID: 20251017_matching
Revises: 68253ac0121c
Create Date: 2025-10-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251017_matching'
down_revision = '68253ac0121c'
branch_labels = None
depends_on = None


def upgrade():
    # matching_profiles に avatar_url と meeting_style を追加
    op.add_column('matching_profiles', sa.Column('avatar_url', sa.String(500), nullable=True))
    op.add_column('matching_profiles', sa.Column('meeting_style', sa.String(50), nullable=True))
    
    # identity に 'other' を追加可能にするため、既存の制約を削除して再作成
    # （PostgreSQL の ENUM 型を使用していない場合は不要。現在は String なので制約なし）
    
    # meet_pref の既存値を meeting_style にコピー（互換性のため）
    op.execute("""
        UPDATE matching_profiles 
        SET meeting_style = meet_pref 
        WHERE meet_pref IS NOT NULL
    """)


def downgrade():
    op.drop_column('matching_profiles', 'meeting_style')
    op.drop_column('matching_profiles', 'avatar_url')
