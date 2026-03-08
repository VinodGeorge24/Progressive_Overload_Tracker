# Backend Log

Chronological log of backend-specific decisions and implementation notes. For project-wide decisions see [docs/project-log.md](../../docs/project-log.md).

---

## 2026-02-26

### Slice 1 (Auth) — backend decisions

- **Login:** Authenticate by **email** only. Username is display-only; lookup by email in login.
- **JWT:** Created and verified via `app/core/security.py` (jose + passlib/bcrypt). No server-side invalidation in MVP.
- **Logout:** POST `/auth/logout` returns 200; client is responsible for discarding the token. No token blocklist.
- **Current user:** GET `/api/v1/auth/me` returns the authenticated user (id, email, username, etc.) so the frontend can restore session on load. Implemented in Slice 1 alongside register/login/logout.
- **Password hashing:** Use `security.get_password_hash` and `security.verify_password` in auth service.

**Implemented:** User model, migration a68315694ffd, auth schemas, auth service, deps (get_current_user), auth endpoints (register, login, logout, me), API_CONTRACT update, tests (conftest with in-memory SQLite + get_db override; auth tests mock password hashing to avoid bcrypt/passlib version issues). Frontend: api/client.ts, api/auth.ts, AuthContext, ProtectedRoute, LoginPage, SignupPage, DashboardPage, routes. Slice 1 checkpoint passed.

**Fix (pyproject.toml):** `pip install -e .` failed with PEP 508 validation: `project.dependencies[4]` had invalid format `"pydantic[email]>={2.0.0}"` (curly braces not allowed in version specifiers). Changed to `"pydantic[email]>=2.0.0"` in `backend/pyproject.toml`.

**Fix (circular import):** `uvicorn app.main:app --reload` failed with `ImportError` (circular import: `user` ↔ `base`). Removed model imports from `app/db/base.py`; moved them to `alembic/env.py` so Alembic still discovers models and the app starts without cycle.

**Audit and docs:** Circular-import audit: no remaining cycles; only fragility is re-adding model imports to base.py. Removed unused `settings` import from `app/api/v1/endpoints/auth.py`. Added `.cursor/rules/avoid-circular-imports.mdc`; updated plan (Slice 1/2 + Implementation notes), PROJECT_GUIDE, and docs/slice1-run-and-test.md to be mindful of circular imports and the base/env.py pattern.

**Fix (sign up 500):** Register was returning 500 due to passlib/bcrypt 4.1+ compatibility (internal 72-byte check and `__about__` attribute). Switched `app/core/security.py` to use the `bcrypt` library directly for hashing and verification; passwords truncated to 72 bytes UTF-8 before hashing. Frontend: SignupPage and LoginPage now show "Something went wrong on the server. Please try again." for 5xx responses.

**Verified:** Successful sign up and login (user VinodGeorge24); Dashboard “Hello, VinodGeorge24!”; flow matches docs/slice1-run-and-test.md.

**Session timeout (30 min):** JWT expiry was already 30 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES` in config). No backend change. Frontend now clears token and updates UI on 401 (response interceptor + `auth:session-expired` event). Documented in API_CONTRACT, .env.example, slice1-run-and-test, and project log.

---

## 2026-03-02

### Slice 2: Exercises CRUD — backend

- **Model and migration:** Added `Exercise` model (`backend/app/models/exercise.py`) with fields id, user_id (FK to users with `ondelete="CASCADE"`), name, muscle_group, created_at, updated_at. Added `User.exercises` relationship (string-based to avoid imports) and `Exercise.user` relationship. Imported `Exercise` in `app/models/__init__.py` and `backend/alembic/env.py` so Alembic discovers the table; generated migration `0483435f322d_add_exercises_table.py` and applied it (`alembic upgrade head`).
- **Schemas and service:** Created `backend/app/schemas/exercises.py` (ExerciseCreate, ExerciseUpdate, ExerciseOut). Implemented `backend/app/services/exercises.py` with helpers to list, create, get, update, and delete exercises scoped to the authenticated user (`user_id` filter). Returns Pydantic models via `ExerciseOut.model_validate(...)`.
- **Endpoints and router:** Added `backend/app/api/v1/endpoints/exercises.py` with authenticated routes: `GET /api/v1/exercises/`, `POST /api/v1/exercises/`, `GET /api/v1/exercises/{a_exercise_id}`, `PUT /api/v1/exercises/{a_exercise_id}`, `DELETE /api/v1/exercises/{a_exercise_id}`. Each endpoint uses `get_current_user` and returns 404 with a shared `"Exercise not found"` message when the exercise does not exist or does not belong to the user. Included the router in `backend/app/api/v1/router.py` with prefix `/exercises` and tag `["exercises"]`.
- **Tests:** Added `backend/app/tests/test_exercises.py` to verify (1) full CRUD for a single user (create → list → get → update → delete → 404 after delete) and (2) ownership: a second user cannot list, get, update, or delete another user’s exercise (all 404). Tests run with the in-memory SQLite fixture from `conftest.py`; `pytest app/tests/test_exercises.py -q` passes.

---

## 2026-03-08

### Slice 3: Workout sessions and sets — backend

- **Models and migration:** Added `WorkoutSession` (unique (user_id, date)), `WorkoutExercise`, `Set`; User.workout_sessions and Exercise.workout_exercises relationships. Migration `b7e8c4a1f3d2_add_workout_sessions_tables.py` was written manually (autogenerate failed in one environment with “table alembic_version already exists”). `alembic upgrade head` applies it successfully.
- **Schemas:** `backend/app/schemas/sessions.py` — SetIn/SetOut, WorkoutExerciseIn/Out, SessionCreate, SessionUpdate, SessionOut, SessionListResponse. Used `date_type` alias for `date` to avoid Pydantic field-name shadowing (fix: `date: date | None` raised TypeError when the field name shadowed the type).
- **Service:** `backend/app/services/sessions.py` — create (409 if date exists, 404 if any exercise_id not owned), get, list (limit/offset/start_date/end_date, total count), update (409 if new date already has session, 404 for exercise; replace exercises/sets in one transaction with `expire(session, ["workout_exercises"])` after delete to avoid “instance has been deleted” on commit), delete.
- **Endpoints:** `backend/app/api/v1/endpoints/sessions.py` — GET/POST `/api/v1/sessions`, GET/PUT/DELETE `/api/v1/sessions/{id}`; 409 and 404 mapped to service detail messages.
- **Tests:** `backend/app/tests/test_sessions.py` — CRUD + list (sessions + total), POST same date → 409, PUT to existing date → 409, other user’s session → 404 (get/put/delete), create session with other user’s exercise_id → 404. All 10 tests (auth + exercises + sessions) pass.

### Duplicate sets when loading session (fixed)

- **Problem:** Viewing a workout (Today’s log or History → edit) showed the same set repeated multiple times (e.g. Set #1 and Set #2 each appearing 4 times). Data was correct in the DB; the bug was in how sessions were loaded.
- **Cause:** In `sessions.py`, session queries used two separate `joinedload(WorkoutSession.workout_exercises).joinedload(...)` calls (one for `WorkoutExercise.exercise`, one for `WorkoutExercise.sets`). Loading the same parent relationship twice with different nested loads can make SQLAlchemy duplicate collection entries, so `session.workout_exercises` and/or each `we.sets` contained repeated items.
- **Fix:** Use a single load of `workout_exercises` with nested `.options()` to load both sub-relationships: `joinedload(WorkoutSession.workout_exercises).options(joinedload(WorkoutExercise.exercise), joinedload(WorkoutExercise.sets))`. Applied in all four places: after create, in get_session_for_user, in list_sessions_for_user, and after update.

### Last-sets for pre-fill

- **Endpoint:** GET `/api/v1/sessions/last-sets?exercise_id=...` returns the most recent session's sets for that exercise (LastSetsOut: date, sets with set_number, weight, reps). Used by frontend to pre-fill when adding or changing an exercise on Log/Session Edit.
- **Service:** `get_last_sets_for_exercise(a_db, a_user, a_exercise_id)` — verifies exercise is owned, finds latest WorkoutExercise for that exercise_id in user's sessions, returns that workout's sets. None if never logged or exercise not owned. Schemas: LastSetPoint, LastSetsOut in `schemas/sessions.py`. Route registered before `/{a_session_id}` so `/last-sets` is matched.
