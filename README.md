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

Recurring SMS reminders:

```bash
cd backend
python scripts/run_reminders.py
```

Run the reminder script from a platform cron every 5–15 minutes. The Render
Blueprint includes a starter cron service for this. It checks
weekly schedules in Africa/Accra time and records each execution so repeated
cron calls do not send the same reminder twice. Configure
`SMS_PROVIDER` (`arkesel` or `moolre`) and the matching provider credentials
before sending SMS.

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

## Deploy: Render (backend) + Vercel (frontend)

### 1. Render — FastAPI

1. Push this repository to GitHub (or GitLab / Bitbucket supported by Render).
2. In [Render](https://dashboard.render.com): **New** → **Blueprint** → select the repo → Render reads `render.yaml` at the repository root.
3. In the web service **Environment** tab, set (or confirm) these variables:
   - `DATABASE_URL` — PostgreSQL connection string (Render Postgres or Supabase). For Supabase, copy the current string from **Supabase Dashboard -> Connect -> ORMs**.
     Direct example: `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`.
     Shared pooler session mode, if direct IPv6 connectivity is not available: `postgresql://postgres.<project-ref>:<password>@aws-<region>.pooler.supabase.com:5432/postgres`.
     If Render logs show `tenant/user postgres.<project-ref> not found`, Render is using a pooler URL whose project ref/user cannot be found. Switch `DATABASE_URL` to the current direct connection string or re-copy the pooler string from the active Supabase project, then redeploy.
   - `SECRET_KEY` — long random string (e.g. `openssl rand -hex 32`).
   - `SMS_PROVIDER` — `arkesel` or `moolre`.
   - `ARKESEL_API_KEY` / `ARKESEL_SENDER_ID` or `MOOLRE_VAS_KEY` / `MOOLRE_SENDER_ID` — required for the selected live SMS provider.
   - `CORS_ORIGINS` — comma-separated list of **exact** frontend origins (no trailing slash), for example:
     - `https://your-app.vercel.app`
     - Include preview URLs if you use Vercel previews: `https://your-app-git-feature-xyz.vercel.app`
     - Local dev: `http://localhost:5173`
4. After the first successful deploy, create a superadmin if needed (Render **Shell** from the service, or run locally against production DB):

   ```bash
   cd backend && alembic upgrade head && python scripts/seed_superadmin.py
   ```

5. **Health check:** Render uses `GET /health` (see `render.yaml`). To verify database connectivity after changing credentials, open `https://<your-service>.onrender.com/health/db`; it returns `503` if the API is up but the database connection is failing.

**Manual web service (without Blueprint):** Create a **Web Service**, connect the repo, set **Root Directory** to `backend`, **Build Command** `pip install -r requirements.txt`, **Start Command** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, add the same environment variables, and optionally set **Pre-Deploy Command** to `alembic upgrade head`.

### 2. Vercel — Vite / React

1. In [Vercel](https://vercel.com): **Add New** → **Project** → import the same Git repository.
2. **Root Directory:** set to `frontend` (important for a monorepo).
3. **Framework Preset:** Vite (auto-detected).
4. **Environment variables** (Production and Preview):
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api/v1` (use your real Render URL; must end with `/api/v1`).
5. Redeploy after changing env vars (Vite bakes `VITE_*` at build time).

`frontend/vercel.json` adds SPA rewrites so React Router paths work on refresh.

### 3. Order of operations

1. Deploy the API on Render and confirm `https://<your-service>.onrender.com/health` returns `{"status":"ok"}`.
2. Set `CORS_ORIGINS` on Render to include your final Vercel URL(s).
3. Deploy the frontend on Vercel with `VITE_API_BASE_URL` pointing at Render.

## Current Implemented Modules

- Auth (login, register, me, change-password)
- Members (list/search/create/update/soft-delete/family/export/photo placeholder)
- Attendance (sessions, bulk mark, member history, summary)
- Departments & ministries (flat departments, leaders, many-to-many membership)
- Communication (church-wide or department SMS, Arkesel/Moolre delivery, history, weekly automatic reminders)
- In-app announcements (notification bell, publishing, expiry, and archiving)
- Events and calendar (event registration and registered-member reminders)
- Pastoral follow-up and super-admin audit logs

## Notes

- Instruction docs are under `docs/`.
- Keep secrets out of version control (`.env`, `.env.local` are ignored).
