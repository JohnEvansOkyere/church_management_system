# Living Spring Church Management System

Living Spring International Church Management System is a full-stack platform for managing church members, attendance, donations, groups, events, communication, and reports.

## Tech Stack

- Frontend: React + Vite + Tailwind + React Query + Zustand
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: PostgreSQL (Supabase-ready)
- Auth: JWT + role-based access

## Project Structure

```text
church_management_system/
├── backend/
├── frontend/
├── docs/
├── AGENTS.md
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create env file:

```bash
cp .env.example .env
```

Set at minimum:

- `DATABASE_URL`
- `SECRET_KEY`

Run migrations:

```bash
alembic upgrade head
```

Seed superadmin:

```bash
python scripts/seed_superadmin.py
```

Start backend:

```bash
uvicorn app.main:app --reload
```

API docs:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend dev URL:

- `http://localhost:5173`

Ensure `VITE_API_BASE_URL` points to backend API, for example:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Current Implemented Modules

- Auth (login, register, me, change-password)
- Members (list/search/create/update/soft-delete/family/export/photo placeholder)
- Attendance (sessions, bulk mark, member history, summary)

## Notes

- Instruction docs are under `docs/`.
- Keep secrets out of version control (`.env`, `.env.local` are ignored).
