from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from database import get_db
from auth import get_current_user
from models.task_models import Task, TaskDomainRequirement, TaskSkillRequirement, TaskTypeAssignment
from models.user_models import User
from models.profile_models import ExpertProfile, ExpertSkill
from models.review_models import Review
from schemas.task_schemas import TaskResponse
from schemas.search_schemas import ExpertSearchResult

router = APIRouter(prefix="/search", tags=["search"])

def parse_int_list(raw: Optional[str]) -> List[int]:
    if not raw:
        return []
    values = []
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        if not part.isdigit():
            raise HTTPException(status_code=400, detail=f"Некорректный идентификатор: {part}")
        values.append(int(part))
    return values

def parse_str_list(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    values = []
    for part in raw.split(","):
        part = part.strip()
        if not part or part.lower() == "all":
            continue
        values.append(part)
    return values

@router.get("/tasks", response_model=List[TaskResponse])
async def search_tasks(
    q: Optional[str] = None,
    domain_ids: Optional[str] = None,
    skill_ids: Optional[str] = None,
    task_type_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Task)

    if q:
        query = query.filter(Task.title.ilike(f"%{q}%") | Task.description.ilike(f"%{q}%"))
    if min_price is not None:
        query = query.filter(Task.price >= min_price)
    if max_price is not None:
        query = query.filter(Task.price <= max_price)
    if status:
        statuses = parse_str_list(status)
        if statuses:
            query = query.filter(Task.status.in_(statuses))
    if category:
        query = query.filter(Task.category == category)
    if difficulty:
        query = query.filter(Task.difficulty == difficulty)

    domain_list = parse_int_list(domain_ids)
    if domain_list:
        query = query.join(TaskDomainRequirement).filter(TaskDomainRequirement.domain_id.in_(domain_list))

    skill_list = parse_int_list(skill_ids)
    if skill_list:
        query = query.join(TaskSkillRequirement).filter(TaskSkillRequirement.skill_id.in_(skill_list))

    if task_type_id is not None:
        query = query.join(TaskTypeAssignment).filter(TaskTypeAssignment.task_type_id == task_type_id)

    return query.distinct().offset(skip).limit(limit).all()

@router.get("/experts", response_model=List[ExpertSearchResult])
async def search_experts(
    q: Optional[str] = None,
    domain_ids: Optional[str] = None,
    skill_ids: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    min_rating: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    rating_subq = db.query(
        Review.reviewee_id.label("user_id"),
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("total_reviews")
    ).group_by(Review.reviewee_id).subquery()

    query = db.query(
        User.id.label("user_id"),
        User.name.label("name"),
        ExpertProfile.main_domain_id.label("main_domain_id"),
        ExpertProfile.rate.label("rate"),
        ExpertProfile.experience_years.label("experience_years"),
        ExpertProfile.verification_document_url.label("verification_document_url"),
        func.coalesce(rating_subq.c.avg_rating, 0.0).label("rating"),
        func.coalesce(rating_subq.c.total_reviews, 0).label("total_reviews")
    ).outerjoin(ExpertProfile, ExpertProfile.user_id == User.id
    ).outerjoin(rating_subq, rating_subq.c.user_id == User.id
    ).filter(User.role == "executor")

    if q:
        query = query.filter(User.name.ilike(f"%{q}%"))

    domain_list = parse_int_list(domain_ids)
    if domain_list:
        query = query.filter(ExpertProfile.main_domain_id.in_(domain_list))

    if min_rate is not None:
        query = query.filter(ExpertProfile.rate >= min_rate)
    if max_rate is not None:
        query = query.filter(ExpertProfile.rate <= max_rate)
    if min_rating is not None:
        query = query.filter(func.coalesce(rating_subq.c.avg_rating, 0.0) >= min_rating)

    skill_list = parse_int_list(skill_ids)
    if skill_list:
        query = query.join(ExpertSkill, ExpertSkill.user_id == User.id
        ).filter(ExpertSkill.skill_id.in_(skill_list))

    results = query.distinct().offset(skip).limit(limit).all()
    user_ids = [row.user_id for row in results]

    skills_map: dict[int, list[tuple[int, int]]] = {}
    if user_ids:
        for user_id, skill_id, level in db.query(
            ExpertSkill.user_id,
            ExpertSkill.skill_id,
            ExpertSkill.level
        ).filter(
            ExpertSkill.user_id.in_(user_ids)
        ).all():
            skills_map.setdefault(user_id, []).append((skill_id, level))

    return [
        ExpertSearchResult(
            user_id=row.user_id,
            name=row.name,
            main_domain_id=row.main_domain_id,
            rate=row.rate,
            experience_years=row.experience_years,
            verification_document_url=row.verification_document_url,
            rating=float(row.rating or 0.0),
            total_reviews=int(row.total_reviews or 0),
            skill_ids=[item[0] for item in skills_map.get(row.user_id, [])],
            skills=[{"skill_id": item[0], "level": item[1]} for item in skills_map.get(row.user_id, [])]
        )
        for row in results
    ]
