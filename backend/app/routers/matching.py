from typing import List, Optional, Dict, Set
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import and_, or_, func, select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MatchingProfile, Hobby, MatchingProfileHobby, MatchingProfileImage, Like, Match, Chat, Message
from app.auth import get_current_active_user
from jose import jwt, JWTError
import os

router = APIRouter(prefix="/api/matching", tags=["matching"])


def require_premium(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.membership_type != "premium":
        raise HTTPException(status_code=403, detail={"error": "premium_required"})
    return current_user


@router.get("/profiles/me")
def get_my_profile(current_user: User = Depends(require_premium), db: Session = Depends(get_db)):
    prof = db.query(MatchingProfile).filter(MatchingProfile.user_id == current_user.id).first()
    if not prof:
        prof = MatchingProfile(user_id=current_user.id)
        db.add(prof)
        db.commit()
        db.refresh(prof)
    hobbies = (
        db.query(Hobby.name)
        .join(MatchingProfileHobby, MatchingProfileHobby.hobby_id == Hobby.id)
        .filter(MatchingProfileHobby.profile_id == current_user.id)
        .all()
    )
    
    # 画像取得（テーブルが存在しない場合はスキップ）
    images = []
    try:
        images = (
            db.query(MatchingProfileImage)
            .filter(MatchingProfileImage.profile_id == current_user.id)
            .order_by(MatchingProfileImage.display_order)
            .all()
        )
    except Exception:
        # matching_profile_images テーブルがまだ存在しない場合
        pass
    
    return {
        "user_id": prof.user_id,
        "nickname": prof.nickname or "",
        "email": current_user.email or "",
        "display_name": current_user.display_name or "",
        "display_flag": prof.display_flag,
        "prefecture": prof.prefecture or "",
        "age_band": prof.age_band or "",
        "occupation": prof.occupation or "",
        "income_range": prof.income_range or "",
        "meet_pref": prof.meet_pref or "",
        "meeting_style": prof.meeting_style or prof.meet_pref or "",
        "bio": prof.bio or "",
        "identity": prof.identity or "",
        "avatar_url": prof.avatar_url or "",
        "romance_targets": prof.romance_targets or [],
        "hobbies": [h[0] for h in hobbies],
        "images": [{"id": img.id, "url": img.image_url, "order": img.display_order} for img in images],
    }


@router.put("/profiles/me")
def update_my_profile(payload: dict, current_user: User = Depends(require_premium), db: Session = Depends(get_db)):
    prof = db.query(MatchingProfile).filter(MatchingProfile.user_id == current_user.id).first()
    if not prof:
        prof = MatchingProfile(user_id=current_user.id)
        db.add(prof)
        db.flush()
    # 連絡先NG簡易検知（電話/メールの素朴なパターン）
    bio = payload.get("bio")
    if isinstance(bio, str):
        banned_patterns = ["@", "line:", "LINE:", "+81", "tel:", "電話", "gmail.com", "icloud.com"]
        if any(pat in bio for pat in banned_patterns):
            raise HTTPException(status_code=400, detail="bio contains prohibited contact info")
    
    # バリデーション用の定数
    VALID_AGE_BANDS = ['10s_late', '20s_early', '20s_late', '30s_early', '30s_late', '40s_early', '40s_late', '50s_early', '50s_late', '60s_early', '60s_late', '70plus']
    VALID_IDENTITIES = ['gay', 'lesbian', 'bisexual', 'transgender', 'questioning', 'other']
    VALID_MEETING_STYLES = ['msg_first', 'voice_after', 'video_after', 'cafe_meal', 'via_hobby', 'meet_if_conditions', 'meet_first', 'online_only']
    
    # バリデーション
    if "age_band" in payload and payload["age_band"] and payload["age_band"] not in VALID_AGE_BANDS:
        raise HTTPException(status_code=422, detail=f"Invalid age_band. Must be one of: {VALID_AGE_BANDS}")
    if "identity" in payload and payload["identity"] and payload["identity"] not in VALID_IDENTITIES:
        raise HTTPException(status_code=422, detail=f"Invalid identity. Must be one of: {VALID_IDENTITIES}")
    if "meeting_style" in payload and payload["meeting_style"] and payload["meeting_style"] not in VALID_MEETING_STYLES:
        raise HTTPException(status_code=422, detail=f"Invalid meeting_style. Must be one of: {VALID_MEETING_STYLES}")
    
    # Userテーブルのフィールド更新
    if "email" in payload:
        current_user.email = payload["email"]
    if "display_name" in payload:
        current_user.display_name = payload["display_name"]
    if "password" in payload and payload["password"]:
        from app.auth import get_password_hash
        current_user.hashed_password = get_password_hash(payload["password"])
    
    for field in ["nickname", "prefecture", "age_band", "occupation", "income_range", "meet_pref", "bio", "identity", "meeting_style", "avatar_url", "romance_targets"]:
        if field in payload:
            setattr(prof, field, payload.get(field))
    # hobbies
    if "hobbies" in payload and isinstance(payload["hobbies"], list):
        # 現在の関連を全削除→再作成
        db.query(MatchingProfileHobby).filter(MatchingProfileHobby.profile_id == current_user.id).delete()
        names = [str(n).strip() for n in payload["hobbies"] if str(n).strip()]
        if names:
            # 既存/新規を混在で対応
            existing = db.query(Hobby).filter(Hobby.name.in_(names)).all()
            existing_names = {h.name for h in existing}
            for nm in names:
                if nm not in existing_names:
                    h = Hobby(name=nm)
                    db.add(h)
                    db.flush()
                    existing.append(h)
            for h in existing:
                db.add(MatchingProfileHobby(profile_id=current_user.id, hobby_id=h.id))
    db.commit()
    return {"status": "ok"}


@router.put("/profiles/me/visibility")
def update_visibility(display_flag: bool, current_user: User = Depends(require_premium), db: Session = Depends(get_db)):
    prof = db.query(MatchingProfile).filter(MatchingProfile.user_id == current_user.id).first()
    if not prof:
        prof = MatchingProfile(user_id=current_user.id)
        db.add(prof)
    prof.display_flag = bool(display_flag)
    db.commit()
    return {"status": "ok", "display_flag": prof.display_flag}


@router.get("/profiles/{user_id}")
def get_profile_by_id(
    user_id: int,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    prof = db.query(MatchingProfile).filter(MatchingProfile.user_id == user_id).first()
    if not prof or not prof.display_flag:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hobbies = (
        db.query(Hobby.name)
        .join(MatchingProfileHobby, MatchingProfileHobby.hobby_id == Hobby.id)
        .filter(MatchingProfileHobby.profile_id == user_id)
        .all()
    )
    
    images = []
    try:
        images = (
            db.query(MatchingProfileImage)
            .filter(MatchingProfileImage.profile_id == user_id)
            .order_by(MatchingProfileImage.display_order)
            .all()
        )
    except Exception:
        pass
    
    return {
        "user_id": prof.user_id,
        "display_name": user.display_name,
        "display_flag": prof.display_flag,
        "prefecture": prof.prefecture or "",
        "age_band": prof.age_band or "",
        "occupation": prof.occupation or "",
        "income_range": prof.income_range or "",
        "meet_pref": prof.meet_pref or "",
        "meeting_style": prof.meeting_style or prof.meet_pref or "",
        "bio": prof.bio or "",
        "identity": prof.identity or "",
        "avatar_url": prof.avatar_url or "",
        "romance_targets": prof.romance_targets or [],
        "hobbies": [h[0] for h in hobbies],
        "images": [{"id": img.id, "url": img.image_url, "order": img.display_order} for img in images],
    }


@router.get("/search")
def search_profiles(
    prefecture: Optional[str] = Query(None),
    age_band: Optional[str] = Query(None),
    occupation: Optional[str] = Query(None),
    income_range: Optional[str] = Query(None),
    hobbies: Optional[str] = Query(None, description="comma separated"),
    meet_pref: Optional[str] = Query(None),
    identity: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    q = db.query(MatchingProfile, User.display_name).join(User, User.id == MatchingProfile.user_id)
    q = q.filter(MatchingProfile.display_flag == True)
    if prefecture:
        q = q.filter(MatchingProfile.prefecture == prefecture)
    if age_band:
        q = q.filter(MatchingProfile.age_band == age_band)
    if occupation:
        q = q.filter(MatchingProfile.occupation == occupation)
    if income_range:
        q = q.filter(MatchingProfile.income_range == income_range)
    if meet_pref:
        q = q.filter(MatchingProfile.meet_pref == meet_pref)
    if identity:
        q = q.filter(MatchingProfile.identity == identity)
    if hobbies:
        names = [s.strip() for s in hobbies.split(",") if s.strip()]
        if names:
            q = (
                q.join(MatchingProfileHobby, MatchingProfileHobby.profile_id == MatchingProfile.user_id)
                 .join(Hobby, Hobby.id == MatchingProfileHobby.hobby_id)
                 .filter(Hobby.name.in_(names))
            )
    total = q.count()
    rows = q.offset((page - 1) * size).limit(size).all()
    items = [
        {
            "user_id": prof.user_id,
            "display_name": disp,
            "prefecture": prof.prefecture,
            "age_band": prof.age_band,
            "identity": prof.identity,
            "avatar_url": prof.avatar_url or "",
        }
        for prof, disp in rows
    ]
    return {"items": items, "page": page, "size": size, "count": total}


@router.post("/likes/{to_user_id}", status_code=201)
def like_user(
    to_user_id: int,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    if to_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="cannot like yourself")
    # 既存のlike
    like = (
        db.query(Like)
        .filter(Like.from_user_id == current_user.id, Like.to_user_id == to_user_id)
        .first()
    )
    if not like:
        like = Like(from_user_id=current_user.id, to_user_id=to_user_id, status="active")
        db.add(like)
        db.flush()
    else:
        like.status = "active"
    # 相互判定
    reciprocal = (
        db.query(Like)
        .filter(Like.from_user_id == to_user_id, Like.to_user_id == current_user.id, Like.status == "active")
        .first()
    )
    matched = False
    match_id = None
    if reciprocal:
        a, b = sorted([current_user.id, to_user_id])
        existing_match = (
            db.query(Match)
            .filter(Match.user_a_id == a, Match.user_b_id == b)
            .first()
        )
        if not existing_match:
            m = Match(user_a_id=a, user_b_id=b, active_flag=True)
            db.add(m)
            db.flush()
            # チャット作成
            ch = Chat(match_id=m.id)
            db.add(ch)
            db.flush()
            match_id = m.id
        else:
            match_id = existing_match.id
        matched = True
    db.commit()
    return {"status": "liked", "matched": matched, "match_id": match_id}


@router.get("/likes")
def list_likes(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    """自分が送ったいいね一覧を取得"""
    likes = (
        db.query(Like)
        .filter(Like.from_user_id == current_user.id, Like.status == "active")
        .all()
    )
    items = []
    for like in likes:
        other = db.query(User).filter(User.id == like.to_user_id).first()
        prof = db.query(MatchingProfile).filter(MatchingProfile.user_id == like.to_user_id).first()
        items.append({
            "like_id": like.id,
            "user_id": like.to_user_id,
            "display_name": other.display_name if other else f"User {like.to_user_id}",
            "identity": prof.identity if prof else None,
            "prefecture": prof.prefecture if prof else None,
            "age_band": prof.age_band if prof else None,
            "avatar_url": prof.avatar_url if prof else None,
        })
    return {"items": items}


@router.get("/matches")
def list_matches(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    ms = (
        db.query(Match)
        .filter(or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id))
        .all()
    )
    items = []
    for m in ms:
        other_id = m.user_b_id if m.user_a_id == current_user.id else m.user_a_id
        other = db.query(User).filter(User.id == other_id).first()
        items.append({"match_id": m.id, "user_id": other_id, "display_name": other.display_name if other else f"User {other_id}"})
    return {"items": items}


@router.post("/ensure_chat/{to_user_id}")
def ensure_chat(
    to_user_id: int,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    if to_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")
    
    a, b = sorted([current_user.id, to_user_id])
    match = (
        db.query(Match)
        .filter(Match.user_a_id == a, Match.user_b_id == b)
        .first()
    )
    
    if not match:
        raise HTTPException(status_code=404, detail="No match found. You must match with this user first.")
    
    chat = db.query(Chat).filter(Chat.match_id == match.id).first()
    if not chat:
        chat = Chat(match_id=match.id)
        db.add(chat)
        db.commit()
        db.refresh(chat)
    
    return {"chat_id": chat.id}


@router.get("/chats")
def list_chats(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    ms = (
        db.query(Match)
        .filter(or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id))
        .all()
    )
    chat_items = []
    for m in ms:
        ch = db.query(Chat).filter(Chat.match_id == m.id).first()
        if not ch:
            ch = Chat(match_id=m.id)
            db.add(ch)
            db.flush()
        other_id = m.user_b_id if m.user_a_id == current_user.id else m.user_a_id
        other = db.query(User).filter(User.id == other_id).first()
        last_msg = (
            db.query(Message).filter(Message.chat_id == ch.id).order_by(Message.created_at.desc()).first()
        )
        chat_items.append({
            "chat_id": ch.id,
            "with_user_id": other_id,
            "with_display_name": other.display_name if other else f"User {other_id}",
            "last_message": last_msg.body if last_msg else None,
        })
    return {"items": chat_items}


def _ensure_chat_access(chat_id: int, user_id: int, db: Session) -> Chat:
    ch = db.query(Chat).filter(Chat.id == chat_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="chat not found")
    m = db.query(Match).filter(Match.id == ch.match_id).first()
    if not m or (m.user_a_id != user_id and m.user_b_id != user_id):
        raise HTTPException(status_code=403, detail="forbidden")
    return ch


@router.get("/chats/{chat_id}/messages")
def get_messages(
    chat_id: int,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    ch = _ensure_chat_access(chat_id, current_user.id, db)
    msgs = db.query(Message).filter(Message.chat_id == ch.id).order_by(Message.created_at.asc()).all()
    return {"items": [
        {"id": m.id, "chat_id": m.chat_id, "sender_id": m.sender_id, "body": m.body, "created_at": m.created_at} for m in msgs
    ]}


@router.post("/chats/{chat_id}/messages", status_code=201)
def send_message(
    chat_id: int,
    payload: dict,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
):
    ch = _ensure_chat_access(chat_id, current_user.id, db)
    body = (payload or {}).get("body")
    if not body or not str(body).strip():
        raise HTTPException(status_code=400, detail="message body required")
    msg = Message(chat_id=ch.id, sender_id=current_user.id, body=str(body).strip())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "chat_id": msg.chat_id, "sender_id": msg.sender_id, "body": msg.body, "created_at": msg.created_at}


# ===== WebSocket (simple in-process pub/sub) =====
WS_SECRET = os.getenv("SECRET_KEY", "your-secret-key-here")
WS_ALG = os.getenv("ALGORITHM", "HS256")
chat_connections: Dict[int, Set[WebSocket]] = {}


@router.websocket("/ws/matching/chat")
async def ws_chat(websocket: WebSocket):
    # Expect query: ?chat_id=...&token=...
    params = dict(websocket.query_params)
    chat_id_raw = params.get("chat_id")
    token = params.get("token")
    if not chat_id_raw or not token:
        await websocket.close(code=1008)
        return
    try:
        chat_id = int(chat_id_raw)
    except ValueError:
        await websocket.close(code=1008)
        return

    # Authn: decode JWT
    try:
        payload = jwt.decode(token, WS_SECRET, algorithms=[WS_ALG])
        email = payload.get("sub")
        if not email:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    # Authz: user has access to chat
    with next(get_db()) as db:
        user: User = db.query(User).filter(User.email == email).first()
        if not user:
            await websocket.close(code=1008)
            return
        try:
            _ensure_chat_access(chat_id, user.id, db)
        except HTTPException:
            await websocket.close(code=1008)
            return

    await websocket.accept()
    chat_connections.setdefault(chat_id, set()).add(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            body = str(data.get("body", "")).strip()
            if not body:
                continue
            # Persist message
            with next(get_db()) as db:
                ch = _ensure_chat_access(chat_id, user.id, db)
                msg = Message(chat_id=chat_id, sender_id=user.id, body=body)
                db.add(msg)
                db.commit()
                db.refresh(msg)
                payload = {
                    "id": msg.id,
                    "chat_id": msg.chat_id,
                    "sender_id": msg.sender_id,
                    "body": msg.body,
                    "created_at": msg.created_at.isoformat() if hasattr(msg.created_at, 'isoformat') else str(msg.created_at),
                }
            # Broadcast to all connections in this chat
            living: Set[WebSocket] = set()
            for ws in chat_connections.get(chat_id, set()):
                try:
                    await ws.send_json(payload)
                    living.add(ws)
                except Exception:
                    # drop dead connection
                    pass
            chat_connections[chat_id] = living
    except WebSocketDisconnect:
        pass
    finally:
        try:
            chat_connections.get(chat_id, set()).discard(websocket)
        except Exception:
            pass


# ===== プロフィール画像管理 =====

@router.post("/profiles/me/images")
def add_profile_image(payload: dict, current_user: User = Depends(require_premium), db: Session = Depends(get_db)):
    """プロフィール画像を追加（最大5枚）"""
    try:
        image_url = payload.get("image_url")
        if not image_url:
            raise HTTPException(status_code=400, detail="image_url is required")
        
        # 現在の画像数を確認
        count = db.query(MatchingProfileImage).filter(MatchingProfileImage.profile_id == current_user.id).count()
        if count >= 5:
            raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
        
        # 次の display_order を決定
        max_order = db.query(func.max(MatchingProfileImage.display_order)).filter(
            MatchingProfileImage.profile_id == current_user.id
        ).scalar()
        next_order = (max_order + 1) if max_order is not None else 0
        
        img = MatchingProfileImage(
            profile_id=current_user.id,
            image_url=image_url,
            display_order=next_order
        )
        db.add(img)
        db.commit()
        db.refresh(img)
        return {"id": img.id, "url": img.image_url, "order": img.display_order}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image table not ready. Please run migration first: {str(e)}")


@router.delete("/profiles/me/images/{image_id}")
def delete_profile_image(image_id: int, current_user: User = Depends(require_premium), db: Session = Depends(get_db)):
    """プロフィール画像を削除"""
    try:
        img = db.query(MatchingProfileImage).filter(
            MatchingProfileImage.id == image_id,
            MatchingProfileImage.profile_id == current_user.id
        ).first()
        if not img:
            raise HTTPException(status_code=404, detail="Image not found")
        
        db.delete(img)
        db.commit()
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image table not ready. Please run migration first: {str(e)}")


@router.put("/profiles/me/images/reorder")
def reorder_profile_images(payload: dict, current_user: User = Depends(require_premium), db: Session = Depends(get_db)):
    """プロフィール画像の順序を変更"""
    try:
        image_ids = payload.get("image_ids", [])
        if not isinstance(image_ids, list) or len(image_ids) > 5:
            raise HTTPException(status_code=400, detail="Invalid image_ids")
        
        for idx, img_id in enumerate(image_ids):
            img = db.query(MatchingProfileImage).filter(
                MatchingProfileImage.id == img_id,
                MatchingProfileImage.profile_id == current_user.id
            ).first()
            if img:
                img.display_order = idx
        
        db.commit()
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image table not ready. Please run migration first: {str(e)}")
