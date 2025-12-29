from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    contract_id: int
    reviewee_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewRead(BaseModel):
    id: int
    contract_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RatingSummary(BaseModel):
    user_id: int
    average_rating: float = 0.0
    total_reviews: int = 0
