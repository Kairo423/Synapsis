from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
from models.user_models import User
from models.profile_models import ExpertProfile, ExpertSkill
from models.catalog_models import Domain, Skill
from schemas.profile_schemas import (
    ExpertProfileRead, ExpertProfileUpdate,
    ExpertSkillRead, ExpertSkillReplace
)

router = APIRouter(prefix="/experts", tags=["experts"])

def require_expert(current_user: User):
    if current_user.role not in ["executor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступен только экспертам"
        )
    return current_user

@router.get("/me", response_model=ExpertProfileRead)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_expert(current_user)
    profile = db.query(ExpertProfile).filter(ExpertProfile.user_id == current_user.id).first()
    if not profile:
        profile = ExpertProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/me", response_model=ExpertProfileRead)
async def update_my_profile(
    payload: ExpertProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_expert(current_user)
    if payload.main_domain_id is not None:
        domain = db.query(Domain).filter(Domain.id == payload.main_domain_id).first()
        if not domain:
            raise HTTPException(status_code=404, detail="Область экспертизы не найдена")
    profile = db.query(ExpertProfile).filter(ExpertProfile.user_id == current_user.id).first()
    if not profile:
        profile = ExpertProfile(user_id=current_user.id)
        db.add(profile)
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/me/skills", response_model=List[ExpertSkillRead])
async def replace_my_skills(
    payload: ExpertSkillReplace,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_expert(current_user)
    skill_ids = [item.skill_id for item in payload.skills]
    if skill_ids:
        existing = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
        if len(existing) != len(set(skill_ids)):
            raise HTTPException(status_code=404, detail="Один или несколько навыков не найдены")
    db.query(ExpertSkill).filter(ExpertSkill.user_id == current_user.id).delete()
    for item in payload.skills:
        db.add(ExpertSkill(user_id=current_user.id, skill_id=item.skill_id, level=item.level))
    db.commit()
    return db.query(ExpertSkill).filter(ExpertSkill.user_id == current_user.id).all()

@router.get("/{user_id}", response_model=ExpertProfileRead)
async def get_expert_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(ExpertProfile).filter(ExpertProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Профиль эксперта не найден")
    return profile

@router.get("/{user_id}/skills", response_model=List[ExpertSkillRead])
async def get_expert_skills(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ExpertSkill).filter(ExpertSkill.user_id == user_id).all()

