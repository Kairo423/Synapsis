from pydantic import BaseModel, Field
from typing import List, Optional


class ExpertSkillSummary(BaseModel):
    skill_id: int
    level: int

class ExpertSearchResult(BaseModel):
    user_id: int
    name: str
    main_domain_id: Optional[int] = None
    rate: Optional[float] = None
    experience_years: Optional[int] = None
    verification_document_url: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    skill_ids: List[int] = Field(default_factory=list)
    skills: List[ExpertSkillSummary] = Field(default_factory=list)
