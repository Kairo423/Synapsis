# Synapsis

# Start backend
# Local Run (Legacy)
Open PowerShell
Create virtual enviroment python: `python -m venv venv`
Install the required dependencies: `pip install -r properties.txt`
Then open http://127.0.0.1:8000/docs in your browser

# Docker run
Open docker.desktop
`docker-compose up -d --build`
`docker-compose up -d`

To stop containers:
`docker compose down`

To launch bash inside docker container:
`docker-compose exec backend bash`
`docker-compose exec postgres bash`
and to launch psql inside postgres container:
`psql -h postgres -U $DB_USER -d $DB_NAME -p 5432`
# Start frontend

Run `cd app/frontend` to change directory. 
Run `npm i` to install the dependencies.
`npm i --save-dev @types/react-dom` and `npm i --save-dev @types/react` if react wasn't upload automaticly. 
Run `npm run dev` to start the development server.