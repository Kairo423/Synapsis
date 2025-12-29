from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class TaskSkillRequirementInput(BaseModel):
    skill_id: int
    min_level: Optional[int] = None

class TaskDomainRequirementRead(BaseModel):
    id: int
    domain_id: int

    class Config:
        from_attributes = True

class TaskSkillRequirementRead(BaseModel):
    id: int
    skill_id: int
    min_level: Optional[int] = None

    class Config:
        from_attributes = True

class TaskTypeAssignmentRead(BaseModel):
    id: int
    task_type_id: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    difficulty: Optional[str] = None # low, min, pro, expert
    deadline: Optional[datetime] = None
    repeats: int = 1
    file_link: Optional[str] = None

class TaskCreate(TaskBase):
    domain_ids: Optional[List[int]] = None
    skill_requirements: Optional[List[TaskSkillRequirementInput]] = None
    task_type_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    deadline: Optional[datetime] = None
    repeats: Optional[int] = None
    file_link: Optional[str] = None
    domain_ids: Optional[List[int]] = None
    skill_requirements: Optional[List[TaskSkillRequirementInput]] = None
    task_type_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    status: str
    customer_id: int
    performer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    domain_requirements: List[TaskDomainRequirementRead] = Field(default_factory=list)
    skill_requirements: List[TaskSkillRequirementRead] = Field(default_factory=list)
    type_assignment: Optional[TaskTypeAssignmentRead] = None

    class Config:
        from_attributes = True
