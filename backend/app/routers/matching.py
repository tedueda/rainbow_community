from typing import List, Optional, Dict, Set
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import and_, or_, func, select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MatchingProfile, Hobby, MatchingProfileHobby, Like, Match, Chat, Message
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
    return {
        "user_id": prof.user_id,
        "display_flag": prof.display_flag,
        "prefecture": prof.prefecture,
        "age_band": prof.age_band,
        "occupation": prof.occupation,
        "income_range": prof.income_range,
        "meet_pref": prof.meet_pref,
        "bio": prof.bio,
        "identity": prof.identity,
        "avatar_url": prof.avatar_url,
        "hobbies": [h[0] for h in hobbies],
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
    for field in ["prefecture", "age_band", "occupation", "income_range", "meet_pref", "bio", "identity", "avatar_url"]:
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
