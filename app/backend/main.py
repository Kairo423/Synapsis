from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from endpoints.user_endpoints import router as users_router, auth_router
from endpoints.task_endpoints import router as tasks_router
from endpoints.task_response_endpoints import router as task_responses_router
from endpoints.catalog_endpoints import router as catalogs_router
from endpoints.profile_endpoints import router as profiles_router
from endpoints.contract_endpoints import router as contracts_router
from endpoints.review_endpoints import router as reviews_router
from endpoints.file_endpoints import router as files_router
from endpoints.search_endpoints import router as search_router
from auth import get_current_user
from database import engine, Base, get_db
import models.user_models
import models.task_models
import models.catalog_models
import models.profile_models
import models.contract_models
import models.review_models
import uvicorn

app = FastAPI(
    title="Synapsis",
    version="1.0.0",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},  # Убираем секцию Model из Swagger UI
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
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


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в Synapsis API. Документация: /docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
        uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
    
