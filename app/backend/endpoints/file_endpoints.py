from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
from models.task_models import Task, TaskAttachment, TaskResponse, TaskDeliverable
from models.contract_models import Contract
from schemas.file_schemas import TaskAttachmentRead, TaskDeliverableRead
from utils.file_storage import save_upload_file, BASE_UPLOAD_DIR

router = APIRouter(prefix="/files", tags=["files"])

def _ensure_task_access(task: Task, current_user, extra_allowed_ids=None):
    if current_user.role == "admin":
        return
    allowed_ids = {task.customer_id, task.performer_id}
    if extra_allowed_ids:
        allowed_ids.update(extra_allowed_ids)
    if current_user.id not in allowed_ids:
        raise HTTPException(status_code=403, detail="Доступ запрещен")

@router.post("/tasks/{task_id}/attachments", response_model=TaskAttachmentRead, status_code=status.HTTP_201_CREATED)
async def upload_task_attachment(
    task_id: int,
    upload_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    if current_user.role != "admin" and task.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Только заказчик может загружать файлы задания")

    try:
        relative_path = save_upload_file(upload_file, f"tasks/{task_id}")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    attachment = TaskAttachment(
        task_id=task_id,
        file_url=relative_path,
        filename=upload_file.filename or "file"
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

@router.get("/tasks/{task_id}/attachments", response_model=List[TaskAttachmentRead])
async def list_task_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    _ensure_task_access(task, current_user)
    return db.query(TaskAttachment).filter(TaskAttachment.task_id == task_id).all()

@router.get("/attachments/{attachment_id}/download")
async def download_task_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    attachment = db.query(TaskAttachment).filter(TaskAttachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Файл не найден")
    task = db.query(Task).filter(Task.id == attachment.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    _ensure_task_access(task, current_user)

    file_path = BASE_UPLOAD_DIR / attachment.file_url
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Файл отсутствует на сервере")
    return FileResponse(path=file_path, filename=attachment.filename)

@router.post("/responses/{response_id}/deliverables", response_model=TaskDeliverableRead, status_code=status.HTTP_201_CREATED)
async def upload_deliverable(
    response_id: int,
    upload_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    response = db.query(TaskResponse).filter(TaskResponse.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Отклик не найден")
    if current_user.role != "admin" and response.performer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Только исполнитель может загружать результаты")

    try:
        relative_path = save_upload_file(upload_file, f"deliverables/{response_id}")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    contract = db.query(Contract).filter(Contract.task_response_id == response_id).first()
    deliverable = TaskDeliverable(
        task_id=response.task_id,
        response_id=response_id,
        contract_id=contract.id if contract else None,
        uploaded_by=current_user.id,
        file_url=relative_path,
        filename=upload_file.filename or "file"
    )
    db.add(deliverable)
    db.commit()
    db.refresh(deliverable)
    return deliverable

@router.get("/responses/{response_id}/deliverables", response_model=List[TaskDeliverableRead])
async def list_deliverables_for_response(
    response_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    response = db.query(TaskResponse).filter(TaskResponse.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Отклик не найден")
    task = db.query(Task).filter(Task.id == response.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    _ensure_task_access(task, current_user, extra_allowed_ids={response.performer_id})
    return db.query(TaskDeliverable).filter(TaskDeliverable.response_id == response_id).all()

@router.get("/deliverables/{deliverable_id}/download")
async def download_deliverable(
    deliverable_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    deliverable = db.query(TaskDeliverable).filter(TaskDeliverable.id == deliverable_id).first()
    if not deliverable:
        raise HTTPException(status_code=404, detail="Файл не найден")
    task = db.query(Task).filter(Task.id == deliverable.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    if deliverable.response_id:
        response = db.query(TaskResponse).filter(TaskResponse.id == deliverable.response_id).first()
        _ensure_task_access(task, current_user, extra_allowed_ids={response.performer_id if response else None})
    else:
        _ensure_task_access(task, current_user)

    file_path = BASE_UPLOAD_DIR / deliverable.file_url
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Файл отсутствует на сервере")
    return FileResponse(path=file_path, filename=deliverable.filename)
