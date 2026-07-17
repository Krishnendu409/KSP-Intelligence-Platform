# KSP Datathon 2026 - Conversational AI Platform

This repository contains the solution for the KSP Datathon 2026: Intelligent Conversational AI for the KSP Crime Database.

## Architecture

* **Frontend**: React + Vite + Tailwind CSS (Deployable to Netlify).
* **Backend**: FastAPI (Python) + LangGraph AI Orchestrator (Deployable to Vercel).
* **Database**: Neon Postgres (or local SQLite for dev/testing).

## Deployment Instructions

### 1. Backend (Vercel)
1. Import this repository to Vercel.
2. Ensure the framework preset is **Other** and the root directory is set to `.`.
3. Vercel will automatically use `vercel.json` to route API requests to `backend/app/main.py`.
4. **Environment Variables**: Set `DATABASE_URL` to your Neon Postgres connection string. If omitted, the backend will gracefully fall back to an in-memory SQLite DB and seed it automatically on cold-start (ideal for quick demo purposes).
5. **Limitations**: Vercel Hobby tier has a 10-second timeout for serverless functions. Ensure your LLM provider responds quickly.

### 2. Frontend (Netlify)
1. Import this repository to Netlify.
2. Set the base directory to `frontend`.
3. Set the build command to `npm run build` and publish directory to `dist`.
4. **Environment Variables**: Set `VITE_API_BASE` to your deployed Vercel backend URL (e.g., `https://my-ksp-backend.vercel.app`).
5. Netlify will automatically use the `netlify.toml` for SPA routing.

## Local Development
1. **Backend**: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
2. **Frontend**: `cd frontend && npm install && npm run dev`
