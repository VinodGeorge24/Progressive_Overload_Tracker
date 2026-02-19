# Project Log

Chronological log of project decisions and documentation updates. For weekly progress reports, see [weekly-reports/](weekly-reports/).

---

## 2026-02-19

### Slice 0: Project readiness (plan/coding_plan.md) — ✅ **COMPLETE**

**Scope:** Pre-coding only. No auth, exercises, or other features.

**Checkpoint:** Passed. Backend `GET /health` returns 200; frontend dev server loads placeholder with no errors. Ready to proceed to Slice 1.

**Done:**

1. **Backend config** — `backend/app/core/config.py` already had `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`. Added doc comments referencing plan/coding_plan.md Slice 0 and .env.example. Root `.env.example` updated with Postgres URL for infra and optional `CORS_ORIGINS`. Added `backend/.env.example` with Postgres URL for use with `infra/docker-compose.yml`.

2. **Backend DB wiring** — Confirmed `backend/app/db/base.py` has `Base = declarative_base()` and `Base.metadata`; `backend/alembic/env.py` uses `Base.metadata` and loads `DATABASE_URL` from settings. Added comments referencing Slice 0 and DATA_MODEL.md. Model imports remain commented until models exist.

3. **Frontend env** — Added `frontend/.env.example` with `VITE_API_URL=http://localhost:8000`. Ensure `frontend/.env` or `frontend/.env.local` has the same (copy from .env.example) so the dev server can call the API.

4. **Frontend router** — Wired React Router in `frontend/src/main.tsx` (`BrowserRouter`) and `frontend/src/App.tsx` (`Routes`, `Route path="/"`). Placeholder page at `/` shows "Welcome" and "Get Started" (Slice 0 checkpoint). All new/edited code commented; references to plan and frontend_references/README.md.

5. **Infra** — Removed obsolete `version` from `infra/docker-compose.yml` and added Slice 0 comment. Ran `docker compose -f infra/docker-compose.yml up -d` with Docker Desktop; Postgres container `workout-tracker-db` is up on port 5432. To use Postgres with the backend, set `DATABASE_URL=postgresql://workout_user:workout_password@localhost:5432/workout_tracker` in `backend/.env` (copy from `backend/.env.example`).

6. **Checkpoint:** Verified. Backend health and frontend placeholder both work as specified.

**How to run (for future reference):** Backend: `cd backend`, `pip install -e .`, `uvicorn app.main:app --reload` then open http://localhost:8000/health. Frontend: `cd frontend`, ensure `.env` or `.env.local` has `VITE_API_URL=http://localhost:8000`, run `npm run dev` then open the dev URL (e.g. http://localhost:5173).

---

## 2026-02-18

NOTE: this was not all done in one day, but will start the codebases' logging from 2/18/26.

### Human summary

Scoped the project to a focused workout tracker: single web app with per-set logging (date, set_number, weight in lbs, reps) and per-exercise line charts. One workout per user per day; users can view and edit that day's workout. Removed plateau detection and recommendations from current scope. Weight is lbs only (kg conversion possible later). Documented primary screens (login, dashboard, log workout, history, exercise progress, templates), edge cases (404 for wrong owner, 409 for duplicate session date, 400/422 for validation), and visualization approach: charts generated in the backend with Python (Option A—one chart per metric, filter by set_number); frontend displays chart images. Project-wide terminology for **weight** (weight per set, lbs) and **reps** (repetitions per set) added to DATA_MODEL and referenced across PRD and API_CONTRACT.

### Agent summary

- **Scope**: Single web app. Workout tracker with per-exercise visualization. No plateau detection or recommendations in MVP.
- **Sessions**: One per user per calendar day. User can view/edit that day's workout; cannot create a second session for the same date.
- **Set fields**: date, set_number, **weight** (lbs per set), **reps** (repetitions per set). See DATA_MODEL.md "Project-wide terminology."
- **Units**: Weight stored and displayed in lbs only. Future: optional kg conversion.
- **Visualization**: Charts generated in backend with Python (e.g. matplotlib, Plotly). Option A: one chart per metric (weight, reps), filter by set_number; x = date. Frontend displays backend-served chart images (PNG/SVG or URL).
- **Primary screens**: Login/signup, Dashboard, Log workout, History, Exercise progress (filter by set_number), Templates.
- **Edge cases**: 404 when resource does not exist or does not belong to authenticated user. 409 when POST session for a date that already has a session for this user. 400 for invalid date/set_number/weight/reps. 422 for validation errors. All list/get endpoints scope to current user.
- **API analytics**: Progress endpoint returns series by set_number with points (date, weight, reps, volume). Plateaus and recommendations endpoints marked Future / not in MVP.
- **Docs updated**: PRD, DATA_MODEL, API_CONTRACT, research-notes, README, .cursorrules, ARCHITECTURE, PROJECT_GUIDE, docs/libraries-and-tools.
