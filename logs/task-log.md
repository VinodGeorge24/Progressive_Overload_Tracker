# Task Log

Chronological log of completed and in-progress tasks.

## 2026-02-26 — Slice 1: Auth ✅
- [x] DB: User model + migration
- [x] Backend: Schemas, auth service, deps, endpoints (register, login, logout, me)
- [x] Backend: API_CONTRACT update + at least one auth test
- [x] Frontend: auth API, Login/Signup pages, auth context, protected routes
- [x] Checkpoint: register → login → Dashboard; 401 without token, 200 with token

## 2024-01-XX - Project Initialization
- [x] Created project folder structure
- [x] Set up root-level documentation (README, PRD, API_CONTRACT, DATA_MODEL)
- [x] Created configuration files (.gitignore, .cursorignore, .cursorrules)
- [x] Set up docs/ and logs/ folders
- [x] Backend setup (Slice 0 complete)
- [x] Frontend setup (Slice 0 complete)

---

*Add new entries below as work progresses*

## 2026-03-09 — Debug duplicate sets, signup behavior, and reset DB ✅
- [x] Reproduced and reviewed the earlier “duplicate sets when re‑editing a workout” bug, confirmed the root cause was the double `joinedload(workout_exercises)` pattern in the backend, and verified that the fix (single joinedload with nested `.options(...)`) is present on `main`.
- [x] Investigated signup failures from the UI by hitting `/api/v1/auth/register` directly; confirmed the endpoint returns `400 {"detail": "Email already registered"}` for reused test emails and `201` for brand‑new credentials.
- [x] Stopped the running backend dev server, deleted `backend/workout_tracker.db`, and re‑ran `alembic upgrade head` to recreate a clean SQLite database schema for fresh manual testing.
- [x] Re‑verified backend health by running session, exercise, and auth tests (`pytest app/tests/test_sessions.py`, `test_exercises.py`, `test_auth.py`) to ensure the API remains green before the next interactive run.

## 2026-03-09 — CORS blocking login/signup from frontend ✅
- [x] **Issue:** Frontend at `http://localhost:5174` blocked by CORS when calling `POST /api/v1/auth/login` and `POST /api/v1/auth/register`. Preflight OPTIONS returned 400; response missing `Access-Control-Allow-Origin`.
- [x] **Fix:** In `main.py`, in development always set `_origins = ["*"]` (removed condition `and "*" not in _origins`). `allow_credentials=False` when using `["*"]`.
- [x] **Verified:** Backend started from `backend/`; OPTIONS to `/api/v1/auth/login` and `/api/v1/auth/register` with `Origin: http://localhost:5174` return 200 and `Access-Control-Allow-Origin: *`. Next: test login/signup in browser from `http://localhost:5174`.

## 2026-03-09 — Duplicate sets on view/edit ✅
- [x] **Issue:** After log workout → view/edit, set rows duplicated (Set #1/#2 shown 2× or 4×); multiplies on repeated open/save.
- [x] **Backend:** In `_session_to_out`, dedupe sets by `id` before building `SetOut` list so API never returns duplicate set entries.
- [x] **Frontend:** In `SessionEditPage.tsx`, when mapping session to `localExercises`, dedupe sets by `id` and sort by `set_number`.
- [x] **Verified:** `pytest app/tests/test_sessions.py` passes.

## 2026-03-09 — Root cause fix for persistent duplicated sets ✅
- [x] Reproduced the bug at the API layer with repeated `PUT /api/v1/sessions/{id}` calls and confirmed the response itself was growing from 2 sets to 4, 6, and 8.
- [x] Identified root cause: SQLite foreign keys were not enabled, so deleting `workout_exercises` during session update did not cascade-delete child `sets`; SQLite then reused the parent id and orphaned sets reattached to the new row.
- [x] Fixed SQLite connection setup in `backend/app/db/session.py` and the pytest in-memory engine in `backend/app/tests/conftest.py` to enable `PRAGMA foreign_keys=ON`.
- [x] Added regression coverage in `backend/app/tests/test_sessions.py` to verify repeated session edits keep a stable unique set list and `GET /api/v1/sessions/last-sets` also stays unique.
- [x] Re-verified with `python -m pytest app/tests/test_auth.py app/tests/test_exercises.py app/tests/test_sessions.py` and `npm run build`.

## 2026-03-09 — Exercise delete/recreate stale data cleanup ✅
- [x] Inspected the live SQLite DB and confirmed legacy orphan rows existed in `sets` while `PRAGMA foreign_keys` was off for older connections/data.
- [x] Reproduced the stale-data path where deleting and recreating `Squat` could reconnect old rows through SQLite id reuse.
- [x] Added `backend/scripts/cleanup_orphan_workout_data.py` to remove orphaned `sets`, orphaned `workout_exercises`, and empty `workout_sessions` from existing databases.
- [x] Updated exercise deletion so sessions that become empty after the exercise cascade are removed from history.
- [x] Added a SQLite-specific monotonic exercise id allocation guard so recreated exercises get a fresh `exercise.id` instead of reusing the deleted row's id.
- [x] Added regression coverage proving that deleting an exercise removes its logged data and recreating the same exercise name starts clean.

## 2026-03-09 — Slice 4: Analytics and progress charts ✅
- [x] Added `matplotlib>=3.7.0` to backend dependencies and implemented per-exercise analytics aggregation grouped by `set_number`.
- [x] Added `GET /api/v1/analytics/progress/{exercise_id}` and `GET /api/v1/analytics/progress/{exercise_id}/chart` with authenticated ownership checks and backend PNG rendering.
- [x] Added backend analytics tests for grouped JSON output, filter handling, chart PNG responses, and 404 behavior for non-owned exercises.
- [x] Added frontend analytics API helpers, a new Progress page, and protected routes for `/progress` and `/progress/:exerciseId`.
- [x] Updated `API_CONTRACT.md`, advanced plan status to Slice 5 next, and marked the stale CORS project-log entry complete.

