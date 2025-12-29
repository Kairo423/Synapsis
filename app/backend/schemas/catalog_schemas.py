from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DomainBase(BaseModel):
    name: str
    description: Optional[str] = None

class DomainCreate(DomainBase):
    pass

class DomainUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DomainRead(DomainBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    description: Optional[str] = None
    domain_id: Optional[int] = None

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    domain_id: Optional[int] = None

class SkillRead(SkillBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class TaskTypeCreate(TaskTypeBase):
    pass

class TaskTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TaskTypeRead(TaskTypeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StatusBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class TaskStatusCreate(StatusBase):
    pass

class TaskStatusUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None

class TaskStatusRead(StatusBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ContractStatusCreate(StatusBase):
    pass

class ContractStatusUpdate(TaskStatusUpdate):
    pass

class ContractStatusRead(StatusBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
