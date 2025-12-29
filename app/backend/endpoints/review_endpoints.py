from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from auth import get_current_user
from models.contract_models import Contract
from models.review_models import Review
from models.user_models import User
from schemas.review_schemas import ReviewCreate, ReviewRead, RatingSummary

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == payload.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Контракт не найден")
    if current_user.role != "admin" and current_user.id not in [contract.customer_id, contract.performer_id]:
        raise HTTPException(status_code=403, detail="Вы не участник контракта")

    reviewee_id = payload.reviewee_id
    if reviewee_id is None:
        if current_user.id == contract.customer_id:
            reviewee_id = contract.performer_id
        else:
            reviewee_id = contract.customer_id

    if reviewee_id not in [contract.customer_id, contract.performer_id]:
        raise HTTPException(status_code=400, detail="Некорректный получатель отзыва")
    if reviewee_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя оставить отзыв самому себе")

    existing = db.query(Review).filter(
        Review.contract_id == contract.id,
        Review.reviewer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Отзыв по этому контракту уже оставлен")

    review = Review(
        contract_id=contract.id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/user/{user_id}", response_model=List[ReviewRead])
async def list_reviews_for_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Review).filter(Review.reviewee_id == user_id).all()

@router.get("/user/{user_id}/rating", response_model=RatingSummary)
async def get_rating_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avg_rating, total = db.query(
        func.coalesce(func.avg(Review.rating), 0.0),
        func.count(Review.id)
    ).filter(Review.reviewee_id == user_id).one()

    return RatingSummary(user_id=user_id, average_rating=float(avg_rating), total_reviews=total)

