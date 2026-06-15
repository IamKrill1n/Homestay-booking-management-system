# Repository Guidelines

## Project Overview
- Homestay Booking Management System with a React/Vite frontend and Node/Express backend.
- Frontend lives in `frontend/`; backend lives in `backend/`.
- Database is PostgreSQL, with schema and seed files in `backend/src/db/`.
- The product uses three roles: `common`, `owner`, and `admin`.

## Commands
- Frontend install/build/dev:
  - `cd frontend && npm install`
  - `cd frontend && npm run dev`
  - `cd frontend && npm run build`
- Backend install/dev/start/database init:
  - `cd backend && npm install`
  - `cd backend && npm run dev`
  - `cd backend && npm start`
  - `cd backend && npm run db:init`
- Full stack with Docker:
  - `docker compose up --build`

## Frontend Conventions
- Use React 18, TypeScript, Vite, Tailwind CSS v4, and the existing shadcn/Radix UI components in `frontend/src/app/components/ui/`.
- Keep route-level screens in `frontend/src/app/views/` using the existing `V_*View.tsx` naming style.
- Keep shared UI in `frontend/src/app/components/`.
- Authentication state currently comes from `frontend/src/app/context/AuthContext.tsx`; check it before changing role-gated flows.
- Prefer existing mock data shapes in `frontend/src/app/data/` until a task explicitly moves a flow to the backend API.
- Use the established role strings exactly: `common`, `owner`, `admin`.

## Backend Conventions
- Backend modules use ES modules (`"type": "module"`).
- Keep Express routes in `backend/src/routes/`, controllers in `backend/src/controllers/`, models in `backend/src/models/`, and database access in `backend/src/repositories/`.
- Preserve the existing MVC-style naming convention where present: `M_*` for models and `C_*` for controllers.
- API routes are mounted under `/api` from `backend/src/server.js`.
- Use `backend/src/db/pool.js` for PostgreSQL access instead of creating separate database clients.

## Database Notes
- Schema source is `backend/src/db/schema.sql`; seed data is `backend/src/db/seed.sql`.
- Docker Compose starts PostgreSQL with database `homestay`, user `postgres`, and password `postgres`.
- Avoid destructive schema changes unless the task explicitly asks for a reset or migration-style change.

## Quality Checks
- There is no test suite configured yet.
- For frontend changes, run `cd frontend && npm run build`.
- For backend changes, run at least `cd backend && node --check src/server.js`; when database behavior changes, also run the relevant app flow against PostgreSQL if available.
- If a command cannot be run because dependencies or services are missing, report that clearly.

## Git Hygiene
- The worktree may contain user changes. Do not revert files unless explicitly asked.
- Keep changes focused on the requested task and avoid broad refactors.
