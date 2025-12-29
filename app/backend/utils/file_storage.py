import os
import shutil
from pathlib import Path
from uuid import uuid4

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".zip"}

BASE_UPLOAD_DIR = Path(
    os.getenv("UPLOAD_DIR", Path(__file__).resolve().parent.parent / "uploads")
)

def validate_extension(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Недопустимый формат файла: {ext}")
    return ext

def save_upload_file(upload_file, subdir: str) -> str:
    if not upload_file.filename:
        raise ValueError("Имя файла отсутствует")
    ext = validate_extension(upload_file.filename)
    target_dir = BASE_UPLOAD_DIR / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}{ext}"
    file_path = target_dir / stored_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    relative_path = (Path(subdir) / stored_name).as_posix()
    return relative_path

