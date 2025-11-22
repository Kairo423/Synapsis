from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.user import router as users_router
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

@app.get("/")
def read_root():
    return {"message": "Welcome to My FastAPI App!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
    
