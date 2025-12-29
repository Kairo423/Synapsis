from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ExpertProfileBase(BaseModel):
    main_domain_id: Optional[int] = None
    rate: Optional[float] = None
    bio: Optional[str] = None

class ExpertProfileUpdate(ExpertProfileBase):
    pass

class ExpertProfileRead(ExpertProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExpertSkillInput(BaseModel):
    skill_id: int
    level: int = Field(..., ge=1, le=5)

class ExpertSkillRead(BaseModel):
    id: int
    user_id: int
    skill_id: int
    level: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExpertSkillReplace(BaseModel):
    skills: List[ExpertSkillInput] = Field(default_factory=list)
