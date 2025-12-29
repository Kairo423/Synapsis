from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.task_models import Task, TaskDomainRequirement, TaskSkillRequirement, TaskTypeAssignment
from models.catalog_models import Domain, Skill, TaskType
from schemas.task_schemas import TaskCreate, TaskResponse, TaskUpdate
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/tasks", tags=["tasks"])

VALID_TASK_STATUSES = {"new", "draft", "published", "in_progress", "review", "completed", "cancelled", "blocked"}

def apply_task_requirements(
    task: Task,
    domain_ids,
    skill_requirements,
    task_type_id,
    db: Session
):
    if domain_ids is not None:
        if domain_ids:
            unique_domains = list(dict.fromkeys(domain_ids))
            existing_domains = db.query(Domain).filter(Domain.id.in_(unique_domains)).all()
            if len(existing_domains) != len(set(unique_domains)):
                raise HTTPException(status_code=404, detail="Одна или несколько областей не найдены")
            domain_ids = unique_domains
        task.domain_requirements = [
            TaskDomainRequirement(domain_id=domain_id) for domain_id in domain_ids
        ]
    if skill_requirements is not None:
        unique_map = {item.skill_id: item for item in skill_requirements}
        skill_requirements = list(unique_map.values())
        skill_ids = [item.skill_id for item in skill_requirements]
        if skill_ids:
            unique_skills = list(dict.fromkeys(skill_ids))
            existing_skills = db.query(Skill).filter(Skill.id.in_(unique_skills)).all()
            if len(existing_skills) != len(set(unique_skills)):
                raise HTTPException(status_code=404, detail="Один или несколько навыков не найдены")
        task.skill_requirements = [
            TaskSkillRequirement(skill_id=item.skill_id, min_level=item.min_level)
            for item in skill_requirements
        ]
    if task_type_id is not None:
        task_type = db.query(TaskType).filter(TaskType.id == task_type_id).first()
        if not task_type:
            raise HTTPException(status_code=404, detail="Тип задания не найден")
        if task.type_assignment:
            task.type_assignment.task_type_id = task_type_id
        else:
            task.type_assignment = TaskTypeAssignment(task_type_id=task_type_id)

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Создание новой задачи. Только для пользователей с ролью 'provider', 'customer' или 'admin'.
    """
    if current_user.role not in ["provider", "customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только заказчики могут создавать задачи"
        )
    
    if task_data.status and task_data.status not in VALID_TASK_STATUSES:
        raise HTTPException(status_code=400, detail="Недопустимый статус задания")

    task = Task(
        **task_data.dict(exclude={"domain_ids", "skill_requirements", "task_type_id"}),
        customer_id=current_user.id,
        status=task_data.status or "new"
    )
    
    db.add(task)
    apply_task_requirements(
        task,
        task_data.domain_ids,
        task_data.skill_requirements,
        task_data.task_type_id,
        db
    )
    db.commit()
    db.refresh(task)
    
    return task

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получение списка задач
    """
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks

@router.get("/my", response_model=List[TaskResponse])
async def get_my_tasks(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Получение списка задач текущего поставщика
    """
    if current_user.role not in ["provider", "customer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только заказчики могут просматривать свои задачи"
        )
    
    tasks = db.query(Task).filter(Task.customer_id == current_user.id).all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """
    Получение задачи по ID
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int, 
    task_update: TaskUpdate, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Обновление задачи. Только владелец или админ.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if current_user.role not in ["provider", "customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на редактирование задач"
        )
    
    if current_user.role != "admin" and task.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете редактировать чужие задачи"
        )
    
    update_data = task_update.dict(exclude_unset=True, exclude={"domain_ids", "skill_requirements", "task_type_id"})
    if "status" in update_data and update_data["status"] not in VALID_TASK_STATUSES:
        raise HTTPException(status_code=400, detail="Недопустимый статус задания")
    for key, value in update_data.items():
        setattr(task, key, value)

    apply_task_requirements(
        task,
        task_update.domain_ids,
        task_update.skill_requirements,
        task_update.task_type_id,
        db
    )
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Удаление задачи. Только владелец или админ.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if current_user.role not in ["provider", "customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на удаление задач"
        )

    if current_user.role != "admin" and task.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете удалять чужие задачи"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Задача успешно удалена"}
