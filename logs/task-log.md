# Task Log

Chronological log of completed and in-progress tasks.

## 2026-03-25 - Public/auth shell alignment
- [x] Compared the live unauthenticated flow to the authenticated dashboard and confirmed `/`, `/login`, and `/signup` were not all using the same visual shell.
- [x] Added a shared `AuthShell` plus `AuthLoadingScreen` so the welcome page, Login, Signup, and auth-loading views reuse the same dark background, branded card styling, and spacing system.
- [x] Restyled auth form fields, error messaging, primary actions, and footer links without changing the underlying login/signup logic.
- [x] Rebuilt the root `/` welcome route onto the same shell instead of the older minimal placeholder layout.
- [x] Re-verified `/`, `/login`, and `/signup` at `320`, `390`, and `1440` widths with no page-level horizontal overflow.
- [x] Logged in with `test@test.edu` and confirmed the flow still redirects from `/` to `/login` to `/dashboard`.
- [x] Re-ran `npm run build`.

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
 
## 2026-03-23 - Slice 7 dashboard experience refresh
- [x] Audited the dashboard page, current styling approach, and existing `shadcn/ui` support before editing.
- [x] Added reusable dashboard section components plus lightweight `Card`, `Badge`, and `Separator` UI primitives.
- [x] Reworked the dashboard into a stronger dark-mode layout with an app-like nav, hero CTA, quick actions, stat cards, and polished recent-session activity cards.
- [x] Preserved existing routing and functionality while improving hierarchy, spacing, contrast, and hover states.
- [x] Updated planning docs so the dashboard refresh is Slice 7 and export/deployment prep is now Slice 8.
- [x] Re-verified with `npm run build`.

## 2026-03-23 - Slice 6 profile and polish ✅
- [x] Added backend profile update support with `PATCH /api/v1/auth/me`, including username changes and optional password changes gated by the current password.
- [x] Added auth regression coverage for `PATCH /auth/me`, including successful username/password updates and duplicate-username rejection.
- [x] Added frontend profile/settings flow with protected `/settings` and `/profile` routes, auth-context profile syncing, and a dedicated account settings page.
- [x] Added Slice 6 polish touches in the auth flow: accessible loading states, inline success/error messaging, and dashboard navigation to settings.
- [x] Updated `API_CONTRACT.md` and `plan/coding_plan.md` to mark Slice 6 complete.
- [x] Re-verified with `python -m pytest app/tests` and `npm run build`.

## 2026-03-23 - Fix native select dropdown contrast
- [x] Added a reusable `dark-surface-select` style so native select dropdown options stay readable on dark-themed screens.
- [x] Fixed the reported unreadable exercise-change dropdown inside Today&apos;s Log and Session Edit exercise cards.
- [x] Applied the same select contrast rule to other dark-surface selects in Log, Progress, and Templates for consistency.
- [x] Added the select contrast regression pattern to `redundant_mistakes.md`.
- [x] Re-ran `npm run build`.

## 2026-03-23 - Redundant mistakes guidance
- [x] Added root-level `redundant_mistakes.md` to capture repeat repo mistakes before future edits and slices.
- [x] Recorded the repeated UI issue where light buttons on dark pages become hard to read until hover instead of keeping dark text at all times.
- [x] Consolidated other logged pitfalls into the new file, including circular imports, SQLite foreign-key assumptions, duplicate `joinedload(...)` patterns, dev CORS gaps, bad dependency specifiers, Vite install confusion, and duplicate template exercise-id validation.
- [x] Linked the new file from `README.md` and `PROJECT_GUIDE.md`.

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

## 2026-03-22 — Slice 5 prep docs pass ✅
- [x] Marked Slice 4 complete in `plan/coding_plan.md` and set the Slice 4 checkpoint to passed.
- [x] Updated `backend/docs/log.md` to explicitly show Slice 4 completion/readiness for Slice 5.
- [x] Refreshed `backend/README.md`, `PROJECT_GUIDE.md`, and `docs/libraries-and-tools.md` for dependency and security-doc consistency (`matplotlib` active for analytics, direct `bcrypt` hashing in runtime).
- [x] Added repo log entries documenting this pre-Slice-5 documentation alignment pass.

## 2026-03-22 — Slice 5 workout templates ✅
- [x] Added backend template models, migration, schemas, service, endpoints, and regression tests.
- [x] Added frontend template API helpers and a new Templates page for create/edit/delete/use actions.
- [x] Wired Today&apos;s Log to apply a saved template into the existing session editor instead of creating a second logging flow.
- [x] Updated API/plan/log docs to mark Slice 5 complete and Slice 6 next.
- [x] Verified with backend tests, frontend build, Alembic upgrade, and a browser pass of the main template flow.

## 2026-03-22 — Slice 5 follow-up bugfix ✅
- [x] Fixed template duplicate `exercise_id` validation so duplicate rows return `400 Bad Request` with a clear message.
- [x] Added regression test `test_templates_duplicate_exercise_ids_return_400`.
- [x] Corrected malformed JSON in `API_CONTRACT.md` for `GET /api/v1/templates/{template_id}` and documented duplicate-id `400` behavior.
- [x] Re-ran template tests and full backend test suite.

## 2026-03-24 — MVP handoff polish and push prep ✅
- [x] Fixed `formatDateForApi` / today string to use local date parts (not UTC `toISOString`) for workout session dates; noted in `redundant_mistakes.md`.
- [x] Responsive pass: dashboard hero/nav, page headers and sticky footers on log/history/edit flows, History list rows, and contrast tweaks for icon and dashed buttons.
- [x] Extended `redundant_mistakes.md` with split-screen testing and table overflow guidance.
- [x] README **Project status** (Slices 0–7 complete, Slice 8 current), GitHub link, feature list update; fixed em-dash mojibake in plan and backend log headings; plan docs updated so Slice 8 is labeled as the active slice.
- [x] Logged in `docs/project-log.md`; verified with `pytest` and `npm run build`; committed and pushed to `origin main` per `PUSH_TO_GITHUB.md` (README/plan: core complete through Slice 7, Slice 8 optional).

## 2026-03-30 - Dashboard homepage hero layout fix
- [x] Reproduced the dashboard hero clipping with a long account name on the homepage.
- [x] Traced the issue to the `DashboardHero` split layout, where the greeting block and CTA column could not shrink safely inside the fixed page container.
- [x] Reworked `frontend/src/components/dashboard/DashboardHero.tsx` to use a content-first vertical layout, explicit long-name wrapping, and a delayed wide action-row breakpoint so the CTA block never collides with the greeting.
- [x] Logged the regression pattern in `redundant_mistakes.md` for future dashboard/header polish work.
- [x] Re-verified with `npm run build` and a live browser pass on the long-name account at mobile, small-desktop, desktop, and wide-desktop widths.
