# Project Log

Chronological log of project decisions and documentation updates. For weekly progress reports, see [weekly-reports/](weekly-reports/).

---

## 2026-03-22

### Slice 5: Workout templates — COMPLETE

**Scope:** Workout templates end-to-end (backend + frontend) with apply-to-log prefill flow.

**Done:**

1. Added backend template models and migration: `WorkoutTemplate`, `TemplateExercise`, plus Alembic revision `0c542f366960_add_workout_templates_tables.py`.
2. Added backend schemas, service, and endpoints for template CRUD and `GET /api/v1/templates/{template_id}/apply`, which returns a session-shaped prefill payload instead of creating a session directly.
3. Added backend regression coverage in `backend/app/tests/test_templates.py` for CRUD, apply payload generation, ownership rules, and foreign-exercise 404 behavior.
4. Added frontend template API helpers and a new Templates page with create/edit/delete/use actions.
5. Extended Today&apos;s Log so a saved template can prefill exercises and placeholder sets while still using the existing Slice 3 save/update session flow.
6. Updated planning and contract docs to reflect Slice 5 completion and Slice 6 as next.

**Verification:** `pytest app/tests -q`, `npm run build`, `alembic upgrade head`, plus a browser pass covering sign up → create exercises → create template → use template → save workout.

---

### Slice 5 prep: documentation consistency pass

**Scope:** Pre-slice documentation cleanup only (no feature/code behavior changes).

**Done:**

1. Updated `plan/coding_plan.md` to mark **Slice 4** as complete and mark its checkpoint as passed.
2. Updated `backend/docs/log.md` Slice 4 heading/status to clearly indicate completion and readiness for Slice 5.
3. Updated `backend/README.md` manual dependency install line to reflect current analytics/password stack (`matplotlib`, `bcrypt`) used in the project.
4. Updated `PROJECT_GUIDE.md` to align backend dependency/security descriptions with current implementation (Slice 4 dependency included; direct bcrypt hashing noted).
5. Updated `docs/libraries-and-tools.md` to remove stale pre-Slice-4 wording and document that matplotlib is now in use; clarified passlib is legacy and bcrypt is the active runtime hashing library.

**Result:** Planning and reference documents are now aligned for starting Slice 5.

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

### Session timeout (30 minutes)

**Requirement:** After a period of inactivity (or token age), the user should be logged out so that restarting the app doesn’t leave them “still logged in” indefinitely.

**Implementation:** Backend already issues JWTs with a 30-minute expiry (`ACCESS_TOKEN_EXPIRE_MINUTES`, default 30 in `backend/app/core/config.py`). Added frontend behavior: (1) API client response interceptor — on any 401 (e.g. expired or invalid token), clear the stored token and dispatch a custom event `auth:session-expired`. (2) AuthContext listens for that event and sets user to null so the UI shows as logged out and protected routes redirect to login. (3) Shared `TOKEN_KEY` moved to `frontend/src/api/constants.ts` to avoid circular imports between client and auth. Docs: API_CONTRACT (session expiry note), backend `.env.example` (optional `ACCESS_TOKEN_EXPIRE_MINUTES`), slice1-run-and-test (session timeout note), project and backend logs.

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

## 2026-03-02

### Slice 2: Exercises CRUD — backend implementation

**Scope:** Slice 2 Exercises CRUD (backend + frontend).

**Done:**

1. **DB — Exercise model and migration** — Added `backend/app/models/exercise.py` (`exercises` table: id, user_id FK to users with `ondelete="CASCADE"`, name, muscle_group, created_at, updated_at). Wired relationships via `User.exercises` and `Exercise.user` without introducing new circular imports. Updated `app/models/__init__.py` and `backend/alembic/env.py` to import `Exercise` for Alembic discovery. Generated and applied Alembic migration `0483435f322d_add_exercises_table.py`.
2. **Backend — Schemas and service** — Added `backend/app/schemas/exercises.py` (ExerciseCreate, ExerciseUpdate, ExerciseOut). Implemented `backend/app/services/exercises.py` with `list_exercises_for_user`, `create_exercise_for_user`, `get_exercise_for_user`, `update_exercise_for_user`, and `delete_exercise_for_user`, all scoped by `user_id` to enforce ownership.
3. **Backend — Endpoints and router** — Added `backend/app/api/v1/endpoints/exercises.py` with authenticated routes: `GET /api/v1/exercises/`, `POST /api/v1/exercises/`, `GET /api/v1/exercises/{a_exercise_id}`, `PUT /api/v1/exercises/{a_exercise_id}`, `DELETE /api/v1/exercises/{a_exercise_id}`. Included the router in `backend/app/api/v1/router.py` with prefix `/exercises` and tag `["exercises"]`. All 404s use a shared `"Exercise not found"` detail constant.
4. **Contract and tests** — Confirmed `API_CONTRACT.md` Exercises section matches the implemented request/response shapes (list returns an array of exercises; individual responses include id, name, muscle_group, created_at/updated_at). Added `backend/app/tests/test_exercises.py` to cover: (a) full CRUD for a single user (create → list → get → update → delete → 404 on get after delete), and (b) ownership rules (second user cannot see or modify first user’s exercises and receives 404). Tests run with the existing in-memory SQLite fixture; `pytest app/tests/test_exercises.py -q` passes.

### Slice 2: Exercises CRUD — frontend implementation

**Done:**

1. **Frontend — API helper** — Added `frontend/src/api/exercises.ts` (list, create, get, update, delete) using the shared axios `apiClient` so the auth header and session-expiry behavior remain consistent.
2. **Frontend — Exercises page** — Added `frontend/src/pages/ExercisesPage.tsx` with a clean, card-based UI inspired by `frontend_references/` (grouped by muscle group) and inline create/edit/delete actions.
3. **Frontend — Routing and navigation** — Added protected route `GET /exercises` (client-side) in `frontend/src/App.tsx` behind `ProtectedRoute`. Updated `DashboardPage` to link to Exercises.
4. **Verification** — `npm run build` completes successfully. Manual sanity-check performed: login → Exercises list → create → edit → delete; backend logs show matching authenticated `/api/v1/exercises` traffic.

**Checkpoint:** Slice 2 is complete end-to-end — authenticated users can manage their exercises from the UI; backend ownership rules are enforced (404 for non-owned resources); `pytest app/tests -q` passes; frontend build succeeds.

---

## 2026-03-08

### Slice 3: Workout sessions and sets — ✅ **COMPLETE**

**Scope:** One workout session per user per day; create/edit sessions with exercises and sets (set_number, weight, reps). 409 on duplicate date (POST and PUT); 404 for other user’s session or non-owned exercise_id.

**Done:**

1. **Doc/plan adjustments (pre-Slice 3)** — API_CONTRACT: PUT 409 for session date conflict, Analytics matplotlib-only; ARCHITECTURE: feature flow order (Schemas → Service → Endpoints), matplotlib; plan: exercise order (array index), set validation (reps > 0, weight ≥ 0, set_number > 0), Slice 6 profile PATCH under `/auth/me`, apply-template clarification, Dashboard step.
2. **DB — Models and migration** — Added `WorkoutSession` (unique (user_id, date)), `WorkoutExercise`, `Set` in `backend/app/models/`; User.workout_sessions, Exercise.workout_exercises relationships. Migration `b7e8c4a1f3d2_add_workout_sessions_tables.py` created manually (autogenerate in some environments hit “table alembic_version already exists” with SQLite; manual migration is reliable). Applied with `alembic upgrade head`.
3. **Backend — Schemas** — `backend/app/schemas/sessions.py`: SetIn/SetOut, WorkoutExerciseIn/Out, SessionCreate, SessionUpdate, SessionOut, SessionListResponse. Used `date_type` alias for session date to avoid Pydantic field-name shadowing.
4. **Backend — Service** — `backend/app/services/sessions.py`: create (409 if date exists, 404 if exercise not owned), get, list (limit/offset/date range, total count), update (409 if new date exists, 404 for exercise), delete. On update, expire session.workout_exercises after deleting children to avoid SQLAlchemy “instance has been deleted” when saving.
5. **Backend — Endpoints and router** — `backend/app/api/v1/endpoints/sessions.py`: GET/POST `/api/v1/sessions`, GET/PUT/DELETE `/api/v1/sessions/{id}`; 409 and 404 handled. Router included with prefix `/sessions`.
6. **Backend — Contract and tests** — API_CONTRACT already described sessions; added PUT 409. `backend/app/tests/test_sessions.py`: CRUD + list with total, POST same date → 409, PUT to existing date → 409, other user GET/PUT/DELETE → 404, session with other user’s exercise_id → 404. All 10 backend tests pass.
7. **Frontend — API** — `frontend/src/api/sessions.ts`: listSessions, getSession, createSession, updateSession, deleteSession, list params, date helpers.
8. **Frontend — Pages** — LogPage (today’s log: create/edit today’s session), HistoryPage (list sessions, link to edit), SessionEditPage (edit by id), DashboardPage (Log Today’s Workout CTA, recent sessions, History link).
9. **Frontend — Routing** — `/log`, `/history`, `/history/:id` (protected).
10. **Dependencies and build** — Backend: `pip install -e ".[dev]"`; frontend: `npm install` (required for Vite; without it `npm run build` failed with “vite is not recognized”). Frontend build succeeds after `npm install`.

**Errors / fixes documented:**

- **Schema date shadowing:** `SessionUpdate.date: date | None` caused `TypeError: unsupported operand type(s) for |: 'NoneType' and 'NoneType'` because the field name `date` shadowed the imported type. Fixed by using `from datetime import date as date_type` and `date_type` in session schemas.
- **Session update SQLAlchemy:** Replacing session exercises (delete old workout_exercises, add new) left the session object holding references to deleted instances; `a_db.add(session)` then raised “Instance has been deleted.” Fixed by calling `a_db.expire(session, ["workout_exercises"])` after the delete loop and removing the redundant `a_db.add(session)` before commit.
- **Alembic autogenerate:** In one environment, `alembic revision --autogenerate` failed with “table alembic_version already exists” during env run. Migration was written manually; `alembic upgrade head` applies it successfully on a fresh or existing DB.
- **Frontend build:** `npm run build` failed with “vite is not recognized” until `npm install` was run in `frontend/` to install dependencies (including Vite).

**Checkpoint:** Create today’s workout with 2+ exercises and sets; view and edit; duplicate date → 409 with clear message. Backend: `pytest app/tests -v` (10 passed); `alembic upgrade head` applies session tables; frontend: `npm run build` succeeds.

### Post–Slice 3: UX, delete workout, and last-sets preset

- **Duplicate sets (fixed):** Session queries used two `joinedload(workout_exercises)` chains, causing duplicated collection entries. Fixed by single `joinedload(workout_exercises).options(joinedload(exercise), joinedload(sets))` in all four load paths. See backend/docs/log.md.
- **Notes per exercise:** Session-level "Workout notes" removed from UI; notes are per exercise (WorkoutExercise.notes). Frontend shows exercise notes textarea per card and sends/loads notes per exercise.
- **Home button:** "Home" link (→ dashboard) added to Log, Session Edit, History, and Exercises headers.
- **Delete workout:** Delete session from Session Edit page and from History list (with confirm). Uses existing DELETE /api/v1/sessions/{id}.
- **White input boxes:** Weight and reps inputs use white background so entry areas are visible on dark theme. Guideline in frontend_references/README.md.
- **Notes per set:** Set table column "Action" → "Notes" with text input per set (Set.notes); delete (×) kept in separate column.
- **Sticky Save:** Sticky footer on Log and Session Edit with hint and Cancel + Save buttons so save is always visible.
- **Last-sets preset:** GET /api/v1/sessions/last-sets?exercise_id=... for pre-fill when adding or changing exercise. Backend: get_last_sets_for_exercise; frontend pre-fills weight/reps from last time. API_CONTRACT updated.

**End of session (2026-03-08):** Changes committed (391077f), pushed to GitHub (origin main). Obsidian sync was skipped (Obsidian CLI unavailable in environment).

---

## 2026-03-09

### Slice 3 verification, signup behavior, and DB reset (prep for fresh tests)

**Scope:** Verify that the workout session duplication bug is fixed on main, confirm signup behavior, and reset the local SQLite database for a clean end‑to‑end run.

**Done:**

1. **Duplicate sets bug — verification only:** Re‑read `backend/app/services/sessions.py` and `backend/docs/log.md` and confirmed that the prior fix for duplicated sets is present: all session load paths now use a single `joinedload(WorkoutSession.workout_exercises).options(joinedload(WorkoutExercise.exercise), joinedload(WorkoutExercise.sets))`, avoiding the earlier pattern that loaded `workout_exercises` twice and produced duplicate rows.
2. **Signup endpoint behavior:** Used FastAPI `TestClient` to call `POST /api/v1/auth/register` with (a) an already‑registered email/username and (b) a fresh email/username. Observed expected behavior: existing email → `400 {"detail": "Email already registered"}`; new email → `201` with user object. Frontend failures seen earlier were due to reusing an existing test email, not a broken register endpoint.
3. **Backend test pass:** Re‑ran backend tests for auth, exercises, and sessions (`pytest app/tests/test_auth.py`, `test_exercises.py`, `test_sessions.py`), all of which passed, confirming the API surface remains green after the Slice 3 work and fixes.
4. **SQLite DB reset for clean run:** Stopped the running `uvicorn` dev server, deleted `backend/workout_tracker.db`, and re‑applied all Alembic migrations via `alembic upgrade head` to recreate an empty schema (users, exercises, workout_sessions/workout_exercises/sets) ready for a fresh end‑to‑end manual test.
5. **Next steps:** Restart backend (`uvicorn app.main:app --reload`) and frontend (`npm run dev` from `frontend/`) and perform a clean run: new signup → login → create/edit sessions (including re‑open/edit of a saved workout) to visually confirm no duplicated sets and correct auth behavior.

### CORS blocking login/signup from frontend (2026-03-09) — COMPLETE

**Observed:** Frontend at `http://localhost:5174` (Vite fallback when 5173 in use) cannot log in or sign up. Browser DevTools shows:
- `Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/login' from origin 'http://localhost:5174' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- Same for `/api/v1/auth/register`.
- Preflight `OPTIONS` requests return **400 Bad Request** and response is missing `Access-Control-Allow-Origin`.

**Root cause:** Backend CORS config originally allowed only `http://localhost:3000` and `http://localhost:5173`. When Vite uses port 5174 (because 5173 is in use), the origin `http://localhost:5174` was not allowed, so the browser blocked the request.

**Attempted fixes (uncommitted):**
1. **config.py:** Expanded `CORS_ORIGINS` default to include `http://localhost:5174`, `http://127.0.0.1:5173`, `http://127.0.0.1:5174`, etc.
2. **main.py:** In development, override to `allow_origins=["*"]` and `allow_credentials=False` so any localhost origin is allowed (auth uses Bearer token, not cookies).

**Resolution (2026-03-09):** The development override in `main.py` was conditional: `if settings.ENVIRONMENT.lower() == "development" and "*" not in _origins`. Under uvicorn the effective config could still be the explicit list (so `http://localhost:5174` was rejected with "Disallowed CORS origin"). **Fix:** In development, always set `_origins = ["*"]` (unconditional). `allow_credentials=False` when using `["*"]` (auth uses Bearer token, not cookies). Verified: OPTIONS preflight for `/api/v1/auth/login` and `/api/v1/auth/register` with `Origin: http://localhost:5174` now return **200** and `Access-Control-Allow-Origin: *`. **Next:** With backend running (`cd backend && uvicorn app.main:app --reload`), test login/signup from frontend at `http://localhost:5174`.

### Duplicate sets on view/edit (2026-03-09)

- **Observed:** After logging a workout and opening view/edit, sets appear duplicated (e.g. Set #1 and #2 each shown 2× or 4×); can multiply on repeated open/save.
- **Fix:** Defensive deduplication. **Backend:** In `_session_to_out` (`backend/app/services/sessions.py`), dedupe each exercise’s sets by `id` before building the output so joinedload row multiplication never produces duplicate set entries. **Frontend:** In `SessionEditPage.tsx`, when loading session into `localExercises`, dedupe sets by `id` and sort by `set_number` so duplicate API data never produces duplicate rows. Backend session tests pass.

### Duplicate sets persisted after edit/save cycles (2026-03-09)

- **Root cause found:** The persistent duplication came from the backend data layer, not just the UI. `PUT /api/v1/sessions/{id}` replaces `workout_exercises`; under SQLite, foreign keys were not enforced, so deleting the old parent row did not cascade-delete its `sets`. Because SQLite reused the deleted parent id, those orphaned set rows reattached to the new `workout_exercise`, and the API returned 2, then 4, then 6 sets on repeated saves.
- **Final fix:** Enabled SQLite foreign keys for every application DB connection and for the pytest in-memory engine. The frontend keeps its defensive dedupe in `SessionEditPage.tsx`, but the API is now the source of truth and returns unique, correctly ordered sets.
- **Verification:** Added a regression test covering repeated updates plus `last-sets`, and re-ran the session test suite after the fix.

### Exercise delete/recreate integrity cleanup (2026-03-09)

- **Observed:** Deleting an exercise and recreating a new exercise with the same name could surface old data in history or `last-sets`. Investigation showed the stale data was not name-based in the frontend; it came from legacy orphan rows in SQLite created before foreign keys were enabled.
- **Root cause:** With `PRAGMA foreign_keys` previously off, deleting an exercise did not cascade-remove dependent `workout_exercises`/`sets`. SQLite can reuse integer primary keys, so recreating the exercise could make those orphan rows appear attached to the new record. Deleting an exercise could also leave an empty `workout_session` if that session only contained the deleted movement.
- **Fix:** Added a cleanup script at `backend/scripts/cleanup_orphan_workout_data.py` for one-time DB repair, updated exercise deletion so any now-empty sessions are removed after the exercise cascade completes, and added a SQLite-specific monotonic exercise id allocation guard so a recreated exercise does not inherit the deleted exercise's id.
- **Verification:** Added backend regression coverage to prove that deleting an exercise removes its logged data, `GET /api/v1/sessions/last-sets?exercise_id=<deleted_id>` returns 404, and recreating the same exercise name starts with clean history/prefill data.

### Slice 4: Analytics and progress charts — COMPLETE

**Scope:** Per-exercise progress analytics and authenticated chart rendering for the frontend.

**Done:**

1. **Backend analytics service** — Added `backend/app/services/analytics.py` to group workout history by `set_number`, compute `weight`, `reps`, and `volume`, and render PNG charts with matplotlib.
2. **Schemas and endpoints** — Added `backend/app/schemas/analytics.py` and `backend/app/api/v1/endpoints/analytics.py` with `GET /api/v1/analytics/progress/{exercise_id}` and `GET /api/v1/analytics/progress/{exercise_id}/chart`.
3. **Dependency and tests** — Added `matplotlib>=3.7.0` to `backend/pyproject.toml` and added analytics test coverage for grouped JSON output, filtered queries, PNG responses, and ownership 404 behavior.
4. **Frontend analytics view** — Added `frontend/src/api/analytics.ts` and `frontend/src/pages/ProgressPage.tsx` with exercise selection, metric/date/set filters, authenticated chart loading, and a raw data panel.
5. **Routing and navigation** — Added protected routes for `/progress` and `/progress/:exerciseId`, plus dashboard entry points to the analytics screen.
6. **Docs and status** — Updated `API_CONTRACT.md` with exact chart endpoint behavior and advanced the plan status to Slice 5 next.

**Checkpoint:** Analytics JSON and chart endpoints are implemented, the frontend route is wired, and the project verifies with fresh backend tests plus a frontend production build.

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
