from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Synapsis", version="1.0.0")

#@app.on_event("startup")
#тут функция запуска бд

@app.get("/")
def read_root():
    return {"message": "Welcome to My FastAPI App!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
    
