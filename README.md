# Synapsis

# Start backend
# Local Run (Legacy)
Open PowerShell
Create virtual enviroment python: `python -m venv venv`
Install the required dependencies: `pip install -r properties.txt`
Then open http://127.0.0.1:8000/docs in your browser

# Docker rup
Open docker.desktop
Сборка образа (из корня репозитория):
`docker build -f app/backend/Dockerfile -t synapsis-backend:latest .`
Запуск контейнера (простой запуск):
`docker run --rm -p 8000:8000 --name synapsis-backend synapsis-backend:latest`

# Start frontend

Run `cd app/frontend` to change directory. 
Run `npm i` and `npm i --save-dev @types/react` to install the dependencies.
`npm i --save-dev @types/react-dom`
Run `npm run dev` to start the development server.