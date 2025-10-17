from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from sqlalchemy import text
import os

router = APIRouter(prefix="/api/ops", tags=["ops"])


@router.post("/run_migration")
def run_migration(
    db: Session = Depends(get_db),
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
):
    # Safety guard: require both env flag and admin secret header
    if os.getenv("ALLOW_MIGRATION_API", "false").lower() != "true":
        raise HTTPException(status_code=403, detail="migration_api_disabled")
    admin_secret = os.getenv("ADMIN_SECRET")
    if not admin_secret or x_admin_secret != admin_secret:
        raise HTTPException(status_code=401, detail="unauthorized")

    # 1) Columns
    db.execute(text("ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"))
    db.execute(text("ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS meeting_style VARCHAR(50)"))

    # 2) Data backfill
    db.execute(text(
        """
        UPDATE matching_profiles
        SET meeting_style = meet_pref
        WHERE meet_pref IS NOT NULL AND meeting_style IS NULL
        """
    ))

    # 3) Images table
    db.execute(text(
        """
        CREATE TABLE IF NOT EXISTS matching_profile_images (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES matching_profiles(user_id) ON DELETE CASCADE,
            image_url VARCHAR(500) NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT unique_profile_order UNIQUE (profile_id, display_order),
            CONSTRAINT check_order_range CHECK (display_order >= 0 AND display_order < 5)
        )
        """
    ))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_profile_images_profile_id ON matching_profile_images(profile_id)"))

    # 4) Hobbies seed (idempotent)
    hobbies = [
        '料理','グルメ','カフェ巡り','お酒・バー','お菓子作り',
        '旅行','温泉','ドライブ','バイク','キャンプ','登山','釣り','海・ビーチ',
        'スポーツ観戦','ランニング','筋トレ','ヨガ','ダンス','サイクリング',
        '音楽鑑賞','楽器','カラオケ','DJ',
        '映画','海外ドラマ','アニメ','マンガ','コスプレ','ゲーム','ボードゲーム',
        'アート','写真','デザイン','ファッション','手芸・DIY',
        '読書','語学','プログラミング','テクノロジー',
        'ペット','ガーデニング','ボランティア','その他'
    ]
    for name in hobbies:
        db.execute(text("INSERT INTO hobbies (name) VALUES (:n) ON CONFLICT (name) DO NOTHING"), {"n": name})

    db.commit()
    return {"status": "ok"}
