from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from endpoints.user_endpoints import router as users_router
from auth import get_current_user
from database import engine, Base, get_db
import models.user_models
import uvicorn

# Настройка FastAPI с кастомной схемой безопасности для куки
app = FastAPI(
    title="Synapsis",
    version="1.0.0",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},  # Убираем секцию Model из Swagger UI
    description="""
    Synapsis API

    ## Аутентификация
    
    Для доступа к защищенным роутам используйте аутентификацию через JWT-токен в куках.
    
    1. Сначала выполните `/users/login` с email и password для получения токена
    2. Токен автоматически сохранится в куки с именем `my_access_token`
    3. Для последующих запросов к защищенным роутам куки будут передаваться автоматически
    
    ## Защищенные роуты
    
    - `/me` - получить информацию о текущем пользователе
    - `/admin` - доступ только для администраторов
    - `/customer` - доступ для клиентов и администраторов
    """
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

# Добавляем глобальные защищенные маршруты
@app.get("/me", tags=["authentication"])
async def get_current_user_info(current_user = Depends(get_current_user)):
    return current_user

@app.get("/admin", tags=["authentication"])
async def admin_only(current_user = Depends(get_current_user)):
    # Проверяем роль пользователя напрямую
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: role mismatch, your role is '{current_user.role}'"
        )
    return {"message": "Welcome, admin!", "user_id": current_user.id, "email": current_user.email, "role": current_user.role}

@app.get("/customer", tags=["authentication"])
async def customer_access(current_user = Depends(get_current_user)):
    # Проверяем роль пользователя - должен быть customer или admin
    if current_user.role not in ["customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: role mismatch, your role is '{current_user.role}'"
        )
    return {"message": "Welcome, customer!", "user_id": current_user.id, "email": current_user.email, "role": current_user.role}

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to My FastAPI App!"}

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
    
