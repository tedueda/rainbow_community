from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Reaction, PointEvent
from app.schemas import Reaction as ReactionSchema, ReactionCreate
from app.auth import get_current_premium_user

router = APIRouter(prefix="/reactions", tags=["reactions"])

@router.post("/", response_model=ReactionSchema)
async def create_reaction(
    reaction: ReactionCreate,
    current_user: User = Depends(get_current_premium_user),
    db: Session = Depends(get_db)
):
    existing_reaction = db.query(Reaction).filter(
        Reaction.user_id == current_user.id,
        Reaction.target_type == reaction.target_type,
        Reaction.target_id == reaction.target_id,
        Reaction.reaction_type == reaction.reaction_type
    ).first()
    
    if existing_reaction:
        raise HTTPException(status_code=400, detail="Reaction already exists")
    
    db_reaction = Reaction(**reaction.dict(), user_id=current_user.id)
    db.add(db_reaction)
    db.commit()
    db.refresh(db_reaction)
    
    return db_reaction

@router.delete("/{reaction_id}")
async def delete_reaction(
    reaction_id: int,
    current_user: User = Depends(get_current_premium_user),
    db: Session = Depends(get_db)
):
    reaction = db.query(Reaction).filter(Reaction.id == reaction_id).first()
    if reaction is None:
        raise HTTPException(status_code=404, detail="Reaction not found")
    
    if reaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(reaction)
    db.commit()
    return {"message": "Reaction deleted successfully"}
