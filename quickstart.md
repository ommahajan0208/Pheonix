# Quickstart

This project includes a Vite React frontend and an Express + SQLite backend.

## Prerequisites
- Node.js 18+ (20+ recommended)
- npm (pnpm optional)

## Optional: Python venv
If you need to run any local Python tooling, create a virtual environment.
```bash
python -m venv .venv
```
```bash
# PowerShell
.venv\Scripts\Activate.ps1
```
```bash
# macOS/Linux
source .venv/bin/activate
```

## Install
```bash
npm install
# or
pnpm install
```

## Run (frontend + backend)
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API: http://localhost:4000

## Run separately
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev:client
```

## Tests
```bash
npm run test:backend
```

## Configuration
- `PORT`: backend listen port (default 4000)
- `DB_FILE`: SQLite file path (default server/data/pheonix.sqlite)

## Notes
- On first run, the backend seeds demo data into the SQLite database.
