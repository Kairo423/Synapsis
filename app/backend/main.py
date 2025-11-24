from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.user_endpoints import router as users_router
from database import engine, Base
import models.user_models
import uvicorn

app = FastAPI(title="Synapsis", version="1.0.0")


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
    
