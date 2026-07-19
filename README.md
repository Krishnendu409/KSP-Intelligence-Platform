# KSP Intelligence Platform

Karnataka State Police crime intelligence & analytical platform. See `context.md` for architecture rules and the `CONTEXT/` folder for domain background.

**For local setup, environment variables, and testing instructions, see [RUNNING.md](RUNNING.md).**

## Architecture

* **Frontend**: React + Vite + TypeScript + Zustand (`frontend/`). Light/dark theme, switchable from the sidebar or login page.
* **Backend**: Express + TypeScript (`backend/functions/ksp_api/`), reading/writing a local SQLite database at `frontend/data/fir_system.sqlite` via `better-sqlite3`.
* **Auth**: JWT-based login against a seeded `Users` table, with role/jurisdiction scoping (SHO/IO/Analyst — Unit or District scoped; SCRB/SP — state-wide) and an append-only `AuditLog` of every request.
* **AI Copilot**: Deterministic only — no LLM in the analytical path (see `frontend/docs/adr/0007-no-llms.md`). Answers are composed from real search/analytics queries, always with the tables/filters/confidence used.
* **Network analysis**: Case/accused/victim/complainant relationship graph derived from real foreign keys, with a real BFS shortest-path tracer (`GET /api/entities/:sourceId/path/:targetId`) — no simulated or fictional network data.

## Quick start

```
cd backend/functions/ksp_api && npm install && cp .env.example .env && npm run db:seed-auth && npm run dev
```

In a second terminal:

```
cd frontend && npm install && cp .env.example .env && npm run dev
```

Then open http://localhost:5173/login. See [RUNNING.md](RUNNING.md) for demo account credentials, the full environment variable reference, database seeding, and how to test.
