# Project Log

Chronological log of project decisions and documentation updates. For weekly progress reports, see [weekly-reports/](weekly-reports/).

---

## 2026-02-26

### Slice 1 (Auth) — decisions and plan

**Scope:** Auth slice only (register, login, logout, JWT, protected routes).

**Decisions logged:**

1. **Login identifier:** Login by **email** only (DATA_MODEL: email for login). Username is for display; no "email or username" login in MVP.
2. **Token storage:** Use **localStorage** for the JWT in the frontend (MVP). Document that we do not invalidate server-side; changing to refresh tokens or blocklist is a future option.
3. **Logout:** Implement as **client discards token** plus optional POST `/auth/logout` returning 200. No server-side token invalidation for MVP.
4. **GET current user:** Add **GET /api/v1/auth/me** (or under users) in Slice 1 so the frontend can restore "logged in" state on reload and protect routes without re-sending credentials. Returns current user from JWT.
5. **Passwords:** Use existing `app/core/security.py` (passlib + bcrypt) for hashing and verification.

**Plan:** See [plan/coding_plan.md](../plan/coding_plan.md) Slice 1; implementation adds GET `/auth/me` as part of auth endpoints. Order: DB (User model + migration) → Schemas → Auth service → Deps → Endpoints (register, login, logout, me) → Contract + test → Frontend (API, pages, auth context, routes) → Checkpoint.

### Slice 1: Auth — ✅ **COMPLETE**

**Checkpoint:** Register → login → see Dashboard; protected endpoint without token → 401; with token → 200.

**Done:**

1. **DB — User model** — `backend/app/models/user.py` (id, email, username, hashed_password, created_at, updated_at, is_active). Exported from `models/__init__.py`; for Alembic, models imported in `alembic/env.py` only (not in `app/db/base.py`, to avoid circular import).
2. **DB — Migration** — `alembic revision --autogenerate -m "add users table"`, `alembic upgrade head`. Revision `a68315694ffd`; `users` table created.
3. **Backend — Schemas** — `backend/app/schemas/auth.py`: RegisterIn, LoginIn, Token, UserOut, TokenWithUser. Pydantic with EmailStr for email; password min 8 chars for register.
4. **Backend — Auth service** — `backend/app/services/auth.py`: register_user, authenticate_user, user_to_out. Uses `app/core/security.py` for hash/verify and JWT.
5. **Backend — Deps** — `backend/app/api/deps.py`: get_current_user (HTTPBearer, decode token, load user by sub; 401 if missing/invalid/inactive).
6. **Backend — Endpoints** — `backend/app/api/v1/endpoints/auth.py`: POST `/register`, POST `/login`, POST `/logout`, GET `/me`. Router included in v1 router with prefix `/auth`.
7. **Backend — Contract and test** — API_CONTRACT.md updated (GET /me, logout note). `backend/app/tests/test_auth.py`: register then login → 200 and access_token; GET /me without token → 401; GET /me with token → 200. conftest: in-memory SQLite with StaticPool; get_db override; password hashing mocked in auth tests to avoid passlib/bcrypt version issues. `pydantic[email]` added to backend deps for EmailStr.
8. **Frontend — API** — `frontend/src/api/client.ts` (axios with base URL and Bearer from localStorage), `frontend/src/api/auth.ts`: register, login, logout, getMe; token in localStorage.
9. **Frontend — Pages** — LoginPage, SignupPage, DashboardPage (placeholder). Forms with error display; success redirect to /dashboard.
10. **Frontend — Auth context and routes** — `frontend/src/contexts/AuthContext.tsx`: user, loading, login, register, logout; restore session via getMe on load. `frontend/src/components/ProtectedRoute.tsx`: redirect to /login if not authenticated. Routes: `/`, `/login`, `/signup`, `/dashboard` (protected). Welcome page redirects to /dashboard if logged in.
11. **Checkpoint** — Verified: register, log in, see Dashboard; GET /api/v1/auth/me without token → 401; with token → 200. Frontend build passes.

### Fix: pyproject.toml PEP 508 dependency format

**Error:** `pip install -e .` in backend failed with:
- `configuration error: project.dependencies[4] must be pep508`
- **GIVEN VALUE:** `"pydantic[email]>={2.0.0}"`
- **OFFENDING RULE:** `format`

**Cause:** PEP 508 dependency strings do not allow curly braces in version specifiers. The value `>={2.0.0}` is invalid.

**Adjustment:** In `backend/pyproject.toml`, changed `"pydantic[email]>={2.0.0}"` to `"pydantic[email]>=2.0.0"`. After this, `pip install -e .` succeeds.

### Fix: Circular import when running uvicorn

**Error:** `uvicorn app.main:app --reload` failed with:
- `ImportError: cannot import name 'User' from partially initialized module 'app.models.user' (most likely due to a circular import)`
- Chain: `main` → `router` → `auth` → `deps` → `app.models.user` (User) → `app.models.__init__` → `app.models.user` again; and `app.models.user` → `app.db.base` (Base) → `app.models.user` (User). So `user.py` ↔ `base.py` formed a cycle.

**Cause:** `app/db/base.py` imported `User` (and was intended to register models for Alembic). Because `app/models/user.py` imports `Base` from `app.db.base`, importing `User` in `base.py` forced loading `user.py` while it was still being loaded.

**Adjustment:** Removed all model imports from `backend/app/db/base.py`. Added model imports to `backend/alembic/env.py` (after `from app.db.base import Base`) so Alembic still discovers models for autogenerate. App startup no longer has a circular import; `alembic current` / migrations still work. Comment in `base.py` updated to state that models must not be imported there and are imported in `alembic/env.py` instead.

### Fix: Sign up failing with 500 (passlib/bcrypt compatibility)

**Observed:** User on Sign up screen submitted registration; backend returned 500; frontend showed "Sign up failed" (generic). Terminal showed: `POST /api/v1/auth/register` → 500, with `ValueError: password cannot be longer than 72 bytes` and `(trapped) error reading bcrypt version` / `AttributeError: module 'bcrypt' has no attribute '__about__'`.

**Cause:** passlib's bcrypt backend, when initializing, runs an internal check with a long test string. bcrypt 4.1+ enforces a 72-byte limit and raises; passlib also fails to read `bcrypt.__about__.__version__` on newer bcrypt. So the first call to `get_password_hash()` (during register) triggered passlib's init and crashed. User's actual password length was irrelevant.

**Backend adjustment:** Replaced passlib with **direct bcrypt** in `backend/app/core/security.py`: `get_password_hash` and `verify_password` now use `bcrypt.hashpw` / `bcrypt.checkpw`. Passwords are encoded to UTF-8 and truncated to 72 bytes before hashing (bcrypt limit). Hashes are stored as strings (decode bytes for DB). This removes the passlib/bcrypt version dependency; `passlib` remains in pyproject.toml but is no longer used for hashing.

**Frontend adjustment:** SignupPage and LoginPage now treat 5xx responses with a clearer message: "Something went wrong on the server. Please try again." instead of only showing `response.data.detail` or a generic "Sign up failed" / "Login failed".

**Verification:** `python -c "from app.core.security import get_password_hash, verify_password; ..."` and `pytest app/tests/test_auth.py` pass. User can retry sign up after restarting the backend.

### Slice 1 auth — successful run verified

End-to-end auth verified: user (VinodGeorge24) completed sign up and login; Dashboard displayed “Hello, VinodGeorge24!” with Home and Log out. Backend (uvicorn) and frontend (npm run dev, http://localhost:5173) were used per docs/slice1-run-and-test.md. No steps from the run guide were missed for a basic run; pytest and npm run build remain recommended for automated verification.

---

### Circular-import audit, run guide, and .cursor rule

**Audit:** Checked backend and frontend import chains. No remaining circular imports. The only cycle had been `app.models.user` ↔ `app.db.base` (already fixed). Fragility: re-adding model imports to `app/db/base.py` would reintroduce the cycle. Frontend: no cycles (App → context/pages/api; api/auth → client).

**Code change:** Removed unused `from app.core.config import settings` from `backend/app/api/v1/endpoints/auth.py`.

**Docs and behavior:**
- **.cursor/rules/avoid-circular-imports.mdc** — New rule (globs: `backend/**/*.py`): do not import models in `app/db/base.py`; import them in `alembic/env.py` for migrations; prefer importing concrete model modules where needed; avoid models importing services/API.
- **plan/coding_plan.md** — Slice 1 step 1 updated to say do NOT import models in base.py, import in alembic/env.py; step 2 notes discovery via env.py; Implementation notes: new bullet on circular imports and reference to .cursor rule; Slice 2 step 1: Alembic discovery via env.py only.
- **PROJECT_GUIDE.md** — backend/app/db/base.py and backend/app/models/ and alembic/env.py rows updated to describe the no-import-in-base pattern and env.py for discovery.
- **docs/slice1-run-and-test.md** — New: how to run backend (uvicorn, alembic), frontend (npm run dev), manual Slice 1 checkpoint steps, backend tests, frontend build, troubleshooting (including circular-import note).
- **docs/README.md** — Added slice1-run-and-test.md to contents.

---

## 2026-02-22

### Security and environment variable protection

**Scope:** Documentation and config hardening per security audit plan (no slice scope change).

**Done:**

1. **README (root)** — Added "Security & environment" section: never commit `.env`; production must use strong random `SECRET_KEY` and different DB credentials; set `CORS_ORIGINS` to actual frontend origin(s) in production. Installation step now references this section.

2. **Backend README** — Added "Security & environment" section: same guidance; documented that `CORS_ORIGINS` accepts either JSON array or comma-separated string (parsed automatically).

3. **Frontend README** — Added security note under "Environment Variables": only use `VITE_*` for non-secret config (e.g. API base URL); these values are embedded in the client bundle and are public.

4. **.env.example (root and backend)** — Added comments that production must use strong random `SECRET_KEY` and different DB credentials; clarified CORS format (comma-separated or JSON).

5. **Backend config** — In `backend/app/core/config.py`, added `field_validator` for `CORS_ORIGINS` to accept comma-separated string from env (split and strip) in addition to list/JSON.

6. **Backend main** — In `backend/app/main.py`, added optional startup warning when `ENVIRONMENT` is production and `SECRET_KEY` is still the default placeholder (log only; does not block startup).

7. **Infra** — In `infra/docker-compose.yml`, added comment that `POSTGRES_PASSWORD` is for local development only; production should use env-injected credentials (e.g. `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}`).

**Reference:** Security plan at `.cursor/plans/security_and_env_protection_f10a345b.plan.md` (or Cursor plans). Aligned with `plan/coding_plan.md`; no slice order or feature scope changes.

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
