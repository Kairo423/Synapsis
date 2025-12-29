from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from auth import get_current_user
from models.catalog_models import Domain, Skill, TaskType, TaskStatus, ContractStatus
from schemas.catalog_schemas import (
    DomainCreate, DomainRead, DomainUpdate,
    SkillCreate, SkillRead, SkillUpdate,
    TaskTypeCreate, TaskTypeRead, TaskTypeUpdate,
    TaskStatusCreate, TaskStatusRead, TaskStatusUpdate,
    ContractStatusCreate, ContractStatusRead, ContractStatusUpdate,
)

router = APIRouter(prefix="/catalogs", tags=["catalogs"])

def require_admin(current_user):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администратор может выполнять это действие"
        )
    return current_user

@router.get("/domains", response_model=List[DomainRead])
async def list_domains(db: Session = Depends(get_db)):
    return db.query(Domain).all()

@router.post("/domains", response_model=DomainRead, status_code=status.HTTP_201_CREATED)
async def create_domain(
    payload: DomainCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    domain = Domain(**payload.dict())
    db.add(domain)
    db.commit()
    db.refresh(domain)
    return domain

@router.put("/domains/{domain_id}", response_model=DomainRead)
async def update_domain(
    domain_id: int,
    payload: DomainUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Область не найдена")
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(domain, key, value)
    db.commit()
    db.refresh(domain)
    return domain

@router.delete("/domains/{domain_id}")
async def delete_domain(
    domain_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Область не найдена")
    db.delete(domain)
    db.commit()
    return {"message": "Область удалена"}

@router.get("/skills", response_model=List[SkillRead])
async def list_skills(domain_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Skill)
    if domain_id is not None:
        query = query.filter(Skill.domain_id == domain_id)
    return query.all()

@router.post("/skills", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
async def create_skill(
    payload: SkillCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    skill = Skill(**payload.dict())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.put("/skills/{skill_id}", response_model=SkillRead)
async def update_skill(
    skill_id: int,
    payload: SkillUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Навык не найден")
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(skill, key, value)
    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Навык не найден")
    db.delete(skill)
    db.commit()
    return {"message": "Навык удален"}

@router.get("/task-types", response_model=List[TaskTypeRead])
async def list_task_types(db: Session = Depends(get_db)):
    return db.query(TaskType).all()

@router.post("/task-types", response_model=TaskTypeRead, status_code=status.HTTP_201_CREATED)
async def create_task_type(
    payload: TaskTypeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    task_type = TaskType(**payload.dict())
    db.add(task_type)
    db.commit()
    db.refresh(task_type)
    return task_type

@router.put("/task-types/{task_type_id}", response_model=TaskTypeRead)
async def update_task_type(
    task_type_id: int,
    payload: TaskTypeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    task_type = db.query(TaskType).filter(TaskType.id == task_type_id).first()
    if not task_type:
        raise HTTPException(status_code=404, detail="Тип задания не найден")
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task_type, key, value)
    db.commit()
    db.refresh(task_type)
    return task_type

@router.delete("/task-types/{task_type_id}")
async def delete_task_type(
    task_type_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    task_type = db.query(TaskType).filter(TaskType.id == task_type_id).first()
    if not task_type:
        raise HTTPException(status_code=404, detail="Тип задания не найден")
    db.delete(task_type)
    db.commit()
    return {"message": "Тип задания удален"}

@router.get("/task-statuses", response_model=List[TaskStatusRead])
async def list_task_statuses(db: Session = Depends(get_db)):
    return db.query(TaskStatus).all()

@router.post("/task-statuses", response_model=TaskStatusRead, status_code=status.HTTP_201_CREATED)
async def create_task_status(
    payload: TaskStatusCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    status_row = TaskStatus(**payload.dict())
    db.add(status_row)
    db.commit()
    db.refresh(status_row)
    return status_row

@router.put("/task-statuses/{status_id}", response_model=TaskStatusRead)
async def update_task_status(
    status_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    status_row = db.query(TaskStatus).filter(TaskStatus.id == status_id).first()
    if not status_row:
        raise HTTPException(status_code=404, detail="Статус задания не найден")
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(status_row, key, value)
    db.commit()
    db.refresh(status_row)
    return status_row

@router.delete("/task-statuses/{status_id}")
async def delete_task_status(
    status_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    status_row = db.query(TaskStatus).filter(TaskStatus.id == status_id).first()
    if not status_row:
        raise HTTPException(status_code=404, detail="Статус задания не найден")
    db.delete(status_row)
    db.commit()
    return {"message": "Статус задания удален"}

@router.get("/contract-statuses", response_model=List[ContractStatusRead])
async def list_contract_statuses(db: Session = Depends(get_db)):
    return db.query(ContractStatus).all()

@router.post("/contract-statuses", response_model=ContractStatusRead, status_code=status.HTTP_201_CREATED)
async def create_contract_status(
    payload: ContractStatusCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    status_row = ContractStatus(**payload.dict())
    db.add(status_row)
    db.commit()
    db.refresh(status_row)
    return status_row

@router.put("/contract-statuses/{status_id}", response_model=ContractStatusRead)
async def update_contract_status(
    status_id: int,
    payload: ContractStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    status_row = db.query(ContractStatus).filter(ContractStatus.id == status_id).first()
    if not status_row:
        raise HTTPException(status_code=404, detail="Статус контракта не найден")
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(status_row, key, value)
    db.commit()
    db.refresh(status_row)
    return status_row

@router.delete("/contract-statuses/{status_id}")
async def delete_contract_status(
    status_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    require_admin(current_user)
    status_row = db.query(ContractStatus).filter(ContractStatus.id == status_id).first()
    if not status_row:
        raise HTTPException(status_code=404, detail="Статус контракта не найден")
    db.delete(status_row)
    db.commit()
    return {"message": "Статус контракта удален"}
