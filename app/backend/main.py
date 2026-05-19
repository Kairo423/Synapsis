from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from logging.handlers import RotatingFileHandler
from pathlib import Path
import logging
import time
from endpoints.user_endpoints import router as users_router, auth_router
from endpoints.task_endpoints import router as tasks_router
from endpoints.task_response_endpoints import router as task_responses_router
from endpoints.catalog_endpoints import router as catalogs_router
from endpoints.profile_endpoints import router as profiles_router
from endpoints.contract_endpoints import router as contracts_router
from endpoints.review_endpoints import router as reviews_router
from endpoints.file_endpoints import router as files_router
from endpoints.search_endpoints import router as search_router
from endpoints.chat_endpoints import router as chat_router
from endpoints.admin_endpoints import router as admin_router
from endpoints.payments_endpoints import router as payments_router
from auth import get_current_user
from database import engine, Base, get_db, SessionLocal
from models.task_models import Task, TaskResponse
from seed_data import seed_catalogs
import models.user_models
import models.task_models
import models.catalog_models
import models.profile_models
import models.contract_models
import models.review_models
import models.chat_models
import uvicorn

app = FastAPI(
    title="Synapsis",
    version="1.0.0",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},  # Убираем секцию Model из Swagger UI
)

LOG_FILE = Path(__file__).resolve().parent.parent / "logs.txt"
logger = logging.getLogger("synapsis")
if not logger.handlers:
    handler = RotatingFileHandler(LOG_FILE, maxBytes=1_000_000, backupCount=3)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    handler.setFormatter(formatter)
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled error path=%s", request.url.path)
        raise
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s %s %.2fms", request.method, request.url.path, response.status_code, duration_ms)
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(task_responses_router)
app.include_router(catalogs_router)
app.include_router(profiles_router)
app.include_router(contracts_router)
app.include_router(reviews_router)
app.include_router(files_router)
app.include_router(search_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(payments_router)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_catalogs(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в Synapsis API. Документация: /docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/health/details")
def health_details(db: Session = Depends(get_db)):
    task_count = db.query(Task).count()
    response_count = db.query(TaskResponse).count()
    return {
        "status": "healthy",
        "tasks": task_count,
        "task_responses": response_count,
    }

if __name__ == "__main__":
        uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
    
