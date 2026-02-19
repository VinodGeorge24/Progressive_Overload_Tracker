# Coding plan

This plan implements the Progressive Overload Tracker in feature slices. Each slice follows the order in [ARCHITECTURE.md](../ARCHITECTURE.md): DB layer → API layer (endpoints + schemas) → Service layer → Update API_CONTRACT.md → At least one test → Frontend (pages + api helpers). No skipping layers.

**Stack reminder:** Backend: FastAPI, SQLAlchemy, Alembic, JWT (core/security.py), PostgreSQL. Frontend: Vite + React + React Router, Tailwind, shadcn/ui. Charts: generated in backend (Python, e.g. matplotlib or Plotly); frontend displays images or embedded URLs. One session per user per calendar day (enforce in DB and API; 409 on duplicate date).

---

## How to use this plan (BY THE SLICE — for AI agents and developers)

- **Code one slice at a time.** Do not implement the next slice until the current slice's checkpoint is met.
- **Within a slice,** follow the numbered substeps in order. Do not skip steps (e.g. do not add frontend before backend endpoints and tests).
- **Scope:** When working on Slice N, do not add features, endpoints, or pages that belong to Slice N+1 or later. If something is "optional" or "later," leave it out until that slice.
- **Checkpoint:** At the end of each slice, verify the listed checkpoint before starting the next slice. If the checkpoint fails, fix the current slice before proceeding.
- **References:** For frontend work, use the design references below for layout, styling, and consistency.

---

## Design references (Stitch from Google + frontend_references)

The UI design ideas in this project are inspired by **Stitch (Google)**. For consistency and visual direction when building frontend slices:

- **Reference folder:** [frontend_references/](../frontend_references/) at project root. Static HTML mockups:
  - [code_log_in.html](../frontend_references/code_log_in.html) — Login: layout, card, primary color, dark mode, Inter font.
  - [code_create_account.html](../frontend_references/code_create_account.html) — Signup: same design language.
  - [code_todays_log.html](../frontend_references/code_todays_log.html) — Today's workout log: nav, layout, logging UI.
  - [code_analytics.html](../frontend_references/code_analytics.html) — Analytics: sidebar, chart area, exercise selector.
- **When implementing any frontend slice:** Open the corresponding reference file for layout, spacing, colors (e.g. primary `#137fec`, background-dark `#101922`), typography (Inter), and component patterns. Implement in React with Tailwind and shadcn/ui.
- See also [frontend/README.md](../frontend/README.md) "Design references" section.

---

## Libraries and install checklist

| Where | Package | Purpose | When to install |
|-------|---------|---------|-----------------|
| **Backend** | `matplotlib` or `plotly` | Chart generation (Slice 4) | Before or at start of Slice 4. Add to `backend/pyproject.toml`, e.g. `matplotlib>=3.7.0` or `plotly>=5.18.0`. |
| **Backend** | (optional) `pillow` | If serving chart as PNG bytes | Only if returning raw image bytes. |
| **Frontend** | Tailwind CSS | Styling | Already installed. |
| **Frontend** | shadcn/ui components | Buttons, inputs, cards | Add via `npx shadcn@latest add button input card dialog ...` as needed. |
| **Frontend** | axios, react-router-dom | API, routing | Already in package.json. |

**Backend chart library:** Add one of matplotlib or Plotly to `backend/pyproject.toml` and run `pip install -e .` before Slice 4. Do not add chart rendering in the frontend for MVP.

---

## Slice 0: Project readiness (pre-coding)

**Scope:** Only Slice 0. Do not implement auth, exercises, or any other feature.

**Substeps (in order):**

1. **Backend config:** Confirm `backend/app/core/config.py` has `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`. Add if missing (use `.env.example`).
2. **Backend DB wiring:** Confirm `backend/app/db/base.py` and `backend/alembic/env.py` have `Base.metadata` and model discovery set up.
3. **Frontend env:** Ensure `frontend/.env` or `frontend/.env.local` has `VITE_API_URL=http://localhost:8000`.
4. **Frontend router:** Confirm React Router in `frontend/src/main.tsx` and `frontend/src/App.tsx`; at least one placeholder route (e.g. `/` → "Welcome").
5. **Infra:** Run `docker compose -f infra/docker-compose.yml up -d`; confirm Postgres up and backend can connect.
6. **Checkpoint:** Backend health `GET /health` returns 200; frontend dev server loads placeholder. No errors. Do not proceed to Slice 1 until this passes.

---

## Slice 1: Auth (register, login, logout, JWT)

**Goal:** Users can register, log in, and receive a JWT; protected routes can read the current user.

**Scope:** Only Slice 1. Do not implement exercises, sessions, analytics, or templates.

**Substeps (in order):**

1. **DB — User model:** Add `User` model in `backend/app/models/` per [DATA_MODEL.md](../DATA_MODEL.md): id, email (unique), username (unique), hashed_password, created_at, updated_at, is_active. Export from `models/__init__.py`; import in `backend/app/db/base.py`.
2. **DB — Migration:** Run `alembic revision --autogenerate -m "add users table"`, then `alembic upgrade head`. Confirm `users` table exists.
3. **Backend — Schemas:** Add Register, Login, Token, UserOut in `backend/app/schemas/`.
4. **Backend — Service:** Add auth service in `backend/app/services/`: register (hash password, create user), login (verify password, create access token, return token + user). Use `backend/app/core/security.py`.
5. **Backend — Deps:** In `backend/app/api/deps.py`, add `get_current_user`: extract Bearer token, decode, load user from DB; raise 401 if invalid/missing.
6. **Backend — Endpoints:** Create `backend/app/api/v1/endpoints/auth.py`: POST `/register`, POST `/login`, POST `/logout`. Include in router with prefix `/auth`, tags `["authentication"]`.
7. **Backend — Contract and test:** Update [API_CONTRACT.md](../API_CONTRACT.md) if needed. Add at least one test: register then login → 200 and access_token. Run tests.
8. **Frontend — API:** Create `frontend/src/api/auth.ts`: register, login, logout; store token; use `Authorization: Bearer <token>` for subsequent requests.
9. **Frontend — Design reference:** Use [frontend_references/code_log_in.html](../frontend_references/code_log_in.html) and [code_create_account.html](../frontend_references/code_create_account.html) (Stitch-inspired).
10. **Frontend — Pages:** Login and Signup pages in `frontend/src/pages/`; on success redirect to Dashboard placeholder.
11. **Frontend — Auth context:** Auth context or hook at app root; protected routes redirect to `/login` if not authenticated. Routes: `/login`, `/signup`, `/` or `/dashboard`.
12. **Checkpoint:** Register, log in, see Dashboard. Protected endpoint without token → 401; with token → 200. Do not proceed to Slice 2 until this passes.

---

## Slice 2: Exercises CRUD

**Goal:** Authenticated user can create, read, update, and delete their own exercises.

**Scope:** Only Slice 2. Do not implement sessions, analytics, or templates.

**Substeps (in order):**

1. **DB — Exercise model:** Add `Exercise` (id, user_id FK, name, muscle_group, created_at, updated_at). Export; Alembic discovery.
2. **DB — Migration:** Run `alembic revision --autogenerate -m "add exercises table"`, then `alembic upgrade head`.
3. **Backend — Schemas:** ExerciseCreate, ExerciseUpdate, ExerciseOut.
4. **Backend — Service:** Exercise service: list by user_id, get/create/update/delete; 404 if not owner.
5. **Backend — Endpoints:** Create `backend/app/api/v1/endpoints/exercises.py`: GET/POST `/api/v1/exercises`, GET/PUT/DELETE `/api/v1/exercises/{exercise_id}`. Include in router with prefix `/exercises`.
6. **Backend — Contract and test:** Update API_CONTRACT.md; test create, list, get; other user's exercise → 404. Run tests.
7. **Frontend — API:** Create `frontend/src/api/exercises.ts`: list, get, create, update, delete (with auth header).
8. **Frontend — Pages:** Exercises list page; create/edit exercise form. Use [frontend_references](../frontend_references/) for consistency.
9. **Frontend — Routing:** `/exercises`, optionally `/exercises/new`, `/exercises/:id/edit`. Auth required.
10. **Checkpoint:** Add, list, edit, delete exercise; other user's exercise → 404. Do not proceed to Slice 3 until this passes.

---

## Slice 3: Workout sessions and sets (core logging)

**Goal:** User can create one workout session per day with exercises and sets; view and edit sessions.

**Scope:** Only Slice 3. Do not implement analytics, templates, or export.

**Substeps (in order):**

1. **DB — Models:** Add `WorkoutSession` (unique (user_id, date)), `WorkoutExercise`, `Set` per [DATA_MODEL.md](../DATA_MODEL.md). Cascade deletes. Export; Alembic discovery.
2. **DB — Migration:** Run autogenerate and upgrade. Confirm unique on (user_id, date).
3. **Backend — Schemas:** Set, WorkoutExercise, SessionCreate, SessionUpdate, SessionOut with nested exercises and sets.
4. **Backend — Service:** Session service: create (409 if session for date exists), get, list (user, limit/offset, date range), update, delete. One transaction for create/update.
5. **Backend — Endpoints:** Create `backend/app/api/v1/endpoints/sessions.py`: GET/POST `/api/v1/sessions`, GET/PUT/DELETE `/api/v1/sessions/{session_id}`. Return 409 on POST when date already has session. Include router with prefix `/sessions`.
6. **Backend — Contract and test:** Update API_CONTRACT.md; test create session with sets, get, POST same date → 409. Run tests.
7. **Frontend — API:** Create `frontend/src/api/sessions.ts`: list, get, create, update, delete; handle 409.
8. **Frontend — Design reference:** Use [frontend_references/code_todays_log.html](../frontend_references/code_todays_log.html).
9. **Frontend — Pages:** "Today's log" page (create/edit today's session); History page (list, view/edit). Session form: date, notes, add exercises, add sets (set_number, weight, reps).
10. **Frontend — Routing:** `/log` or `/workout`, `/history`, `/history/:id`. Auth required.
11. **Checkpoint:** Create today's workout with 2+ exercises and sets; view and edit; duplicate date → 409 with clear message. Do not proceed to Slice 4 until this passes.

---

## Slice 4: Analytics and progress charts

**Goal:** Per-exercise progress data and charts; backend generates chart image; frontend displays it.

**Scope:** Only Slice 4. Do not implement templates, profile, or export.

**Prerequisite:** Add `matplotlib>=3.7.0` or `plotly>=5.18.0` to `backend/pyproject.toml`; run `pip install -e .` from backend.

**Substeps (in order):**

1. **Backend — Analytics service:** Compute progress for exercise (user-scoped): by date and set_number; weight, reps, volume. Return `series` per set_number with `points` (date, weight, reps, volume). Support start_date, end_date, set_number filter.
2. **Backend — Progress endpoint:** GET `/api/v1/analytics/progress/{exercise_id}` with query params. Verify exercise belongs to user (404 otherwise). Include router with prefix `/analytics`.
3. **Backend — Chart endpoint:** GET `/api/v1/analytics/progress/{exercise_id}/chart` with params metric, set_number, start_date, end_date. Generate line chart (matplotlib or Plotly); return PNG. Document in API_CONTRACT.md.
4. **Backend — Contract and test:** Update API_CONTRACT.md; test progress JSON and chart for an exercise. Run tests.
5. **Frontend — API:** Create `frontend/src/api/analytics.ts`: getProgress, getChartImageUrl or image URL.
6. **Frontend — Design reference:** Use [frontend_references/code_analytics.html](../frontend_references/code_analytics.html).
7. **Frontend — Pages:** Progress page: exercise selector, set_number filter, date range; display chart (img); optionally raw data table.
8. **Frontend — Routing:** `/progress`, `/progress/:exerciseId`. Auth required.
9. **Checkpoint:** Progress and chart for an exercise; set_number filter works. Do not proceed to Slice 5 until this passes.

---

## Slice 5: Workout templates (should-have)

**Goal:** User can create and list templates; optionally pre-fill session from template.

**Scope:** Only Slice 5. Do not implement profile, export, or deployment.

**Substeps (in order):**

1. **DB — Models:** Add `WorkoutTemplate`, `TemplateExercise` per DATA_MODEL. Cascade deletes. Migration.
2. **Backend — Schemas:** TemplateCreate, TemplateUpdate, TemplateOut with nested exercises.
3. **Backend — Service:** Template CRUD; scope by user; 404 if not owner.
4. **Backend — Endpoints:** Create `backend/app/api/v1/endpoints/templates.py`: GET/POST `/api/v1/templates`, GET/PUT/DELETE `/api/v1/templates/{template_id}`. Optional: apply template. Include router. Update API_CONTRACT.md.
5. **Backend — Test:** Create template, list, get. Run tests.
6. **Frontend — API:** Create `frontend/src/api/templates.ts`: list, get, create, update, delete; optional apply.
7. **Frontend — Pages:** Templates list; create/edit template. Optionally "Start from template" on Log page.
8. **Frontend — Routing:** `/templates`, `/templates/new`, `/templates/:id/edit`. Auth required.
9. **Checkpoint:** Create template with 2+ exercises; optionally start session from template. Do not proceed to Slice 6 until this passes.

---

## Slice 6: Profile and polish

**Goal:** View and edit profile; consistent error handling, loading states, basic accessibility.

**Scope:** Only Slice 6. Do not implement export or deployment.

**Substeps (in order):**

1. **Backend — Profile endpoints:** GET and PATCH `/api/v1/users/me` (id, email, username, etc.; optional password change). Document in API_CONTRACT.md.
2. **Backend — Test:** Get me, update me. Run tests.
3. **Frontend — API:** getProfile, updateProfile (auth header).
4. **Frontend — Profile page:** Display user; form to edit username (and optionally password). Stitch/frontend_references styling.
5. **Frontend — App-wide polish:** Loading spinners/skeletons; error toasts or inline messages; redirect unauthenticated to login; basic a11y (focus, labels, semantic HTML).
6. **Frontend — Routing:** `/profile` or `/settings`. Auth required.
7. **Checkpoint:** View and edit profile; loading and error states visible; logged-out redirect works. Do not proceed to Slice 7 until this passes.

---

## Slice 7: Export and deployment prep (optional / last)

**Goal:** Export workout data; deployment and runbook.

**Scope:** Final slice. No new feature domains.

**Substeps (in order):**

1. **Backend — Export endpoint:** GET `/api/v1/export` or `/api/v1/sessions/export` (auth required). Return user's data as JSON or CSV; attachment headers. Document in API_CONTRACT.md.
2. **Backend — Test:** Export as authenticated user; 401 when unauthenticated. Run tests.
3. **Frontend — API:** Export function; trigger download.
4. **Frontend — UI:** Export button on History or Dashboard.
5. **Docs:** Update README with env vars, migrations, run instructions, short deployment runbook.
6. **Checkpoint:** Export works; README describes run and deploy. All slices complete.

---

## Implementation notes

- **By the slice:** Implement exactly one slice at a time. Complete every substep and checkpoint before the next slice. Do not mix slices.
- **Order:** Slices 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7. Within each slice: DB → Schemas → Service → Endpoints → Router → Contract + test → Frontend API → Frontend pages → Checkpoint.
- **Naming:** Follow [CODING_STANDARDS.md](../CODING_STANDARDS.md) (e.g. function names UpperCase, parameters a_ prefix in Python).
- **Errors:** Consistent `{"detail": "..."}` and status codes per [API_CONTRACT.md](../API_CONTRACT.md); 404 for "not found or not owner".
- **Charts:** Backend only (matplotlib or Plotly); frontend displays image. One chart per metric (weight, reps, volume), filter by set_number.
- **One session per day:** DB unique (user_id, date); session create returns 409 if duplicate date.
- **Tests:** At least one test per slice (happy path); add 401, 404, 409 as needed.
- **Design:** For every frontend slice, refer to [frontend_references/](../frontend_references/) and Stitch design language.
- **Docs:** Keep API_CONTRACT.md and DATA_MODEL.md in sync with code; update PROJECT_GUIDE or README when adding top-level areas.
