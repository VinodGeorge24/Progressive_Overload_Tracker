# AI Usage Log

This document records any AI assistance used in the development of this project, as required for academic honesty and transparency.

## Purpose

This log tracks:
- What AI tools were used
- When they were used
- What assistance was provided
- How the output was modified or integrated

**Habit:** When making adjustments (fixes, new rules, doc updates, or notable AI-assisted changes), add a corresponding note or entry to this log where relevant so the project maintains a clear record of AI usage and changes.

## Log Format

Each entry should include:
- **Date**: When AI assistance was used
- **Tool**: Which AI tool (ChatGPT, GitHub Copilot, Cursor, etc.)
- **Task**: What was being worked on
- **Prompt/Request**: What was asked of the AI
- **Output**: What the AI provided
- **Modifications**: How the output was changed or adapted
- **Final Result**: What was actually implemented

## Entries

### 2024-01-XX - Initial Project Structure
- **Tool**: Cursor AI
- **Task**: Creating the initial folder structure and documentation files
- **Prompt/Request**: "Please create the following folder structure: [detailed structure provided]"
- **Output**: Complete folder structure with placeholder documentation files
- **Modifications**: Files created with appropriate template content based on descriptions
- **Final Result**: Full project structure established with README files, configuration files, and organized directories

---

*Add new entries below as AI assistance is used throughout the project.*


### Beginning–2/19

**Approximate split:** ~60% of the work was done by me (project direction, reference materials, running services, verification, and review); ~40% was AI-assisted (folder organization, specific code and config changes, documentation updates, and commit/push preparation).

- **Tool**: Cursor AI (agent)
- **Date / period**: From project start through 2026-02-19
- **Task**: Organizing frontend design references, keeping docs consistent with the new structure, completing Slice 0 (project readiness), and preparing a push to GitHub.

**What I did (~60%)**

- Defined the project scope and provided the frontend reference screens (e.g. Stitch-inspired examples) and the idea of a folder-per-screen layout. I specified that references are for inspiration only, not copy-paste.
- Ran the backend locally (`pip install -e .`, `uvicorn app.main:app --reload`), confirmed `GET /health` returns 200, and ran the frontend dev server and verified the placeholder “Welcome” page.
- Started Docker Desktop and ran `docker compose -f infra/docker-compose.yml up -d` so Postgres was available. I verified the environment worked end-to-end.
- Reviewed and approved documentation changes (project log, coding plan, plan/README) and the Slice 0 completion wording.
- Pushed the final commit to GitHub (or directed the push); I own the repo and remote setup.

**What the AI helped with (~40%)**

- **Folder organization and documentation alignment**  
  The AI analyzed the existing frontend reference files and proposed a consistent structure: one folder per screen (e.g. `login_page_-_lift_tracker/`, `today's_log_-_lift_tracker/`), each with `code.html` and optional images. It did not create the reference HTML or images; those were mine or from the provided materials. The AI then updated all references across the repo (e.g. `frontend_references/README.md`, `frontend/README.md`, `PROJECT_GUIDE.md`, `plan/coding_plan.md`, root `README.md`) so docs and the coding plan pointed to the new folder layout and design tokens (e.g. primary `#137fec`, dark background `#101922`). This kept the codebase and docs in sync with how I wanted references used (inspiration only).

- **Consistency pass**  
  The AI scanned the project (frontend_references, plan, frontend README, PROJECT_GUIDE, coding_plan, etc.) and produced a short consistency plan. I chose what to apply; the AI then made the edits (e.g. Slice 3/5 design references, “Today’s” spelling in PROJECT_GUIDE, root README structure and doc links, optional .cursorrules note about frontend_references). I did not write that plan document myself; the AI drafted it and I used it as a checklist.

- **Slice 0 — non-Python and wiring**  
  - **Backend:** The AI added comments and small doc tweaks in `config.py`, `base.py`, and `alembic/env.py` (referencing the plan and DATA_MODEL). It created `backend/.env.example` with a Postgres URL for Docker. I had already set up the backend; the AI did not write core Python logic or API code.  
  - **Frontend:** The AI added React Router in `main.tsx` (e.g. `BrowserRouter`) and in `App.tsx` (e.g. `Routes`/`Route` for `/` with a “Welcome” placeholder). It created `frontend/.env.example` with `VITE_API_URL=http://localhost:8000`. I had the Vite/React app and UI in place; the AI focused on routing and env documentation.  
  - **Infra:** The AI removed the obsolete `version` key from `infra/docker-compose.yml` and added a short comment. I ran Docker and confirmed Postgres.  
  - **Docs:** The AI updated `docs/project-log.md` (2026-02-19) with Slice 0 steps, checkpoint verification, and “How to run,” and updated `plan/coding_plan.md` and `plan/README.md` to mark Slice 0 complete and point to Slice 1.

- **Slice 0 completion and push**  
  I confirmed that both backend and frontend worked as specified. The AI then updated the project log, coding plan, and plan README to state that Slice 0 was complete, and staged all changes, wrote the commit message, and ran `git push -u origin main` (or prepared the commit and I ran the push). The commit included Slice 0 work, frontend_references reorganization, and the doc/consistency changes.

**Modifications to AI output**

- I corrected or adjusted wording in docs (e.g. “Today’s” vs “Todays”) where needed. I chose which consistency items to apply and asked for the Slice 0 checkpoint to be verified locally before marking complete. I requested the 60/40 split and the “Beginning–2/19” framing for this log entry.

**Final result**

- Frontend design references are organized in a single, documented folder layout; all references in the repo point to that layout and to “inspiration only” usage.
- Slice 0 is complete: backend config and DB wiring documented, frontend env and router in place, infra/docker-compose cleaned up, and checkpoint verified (health endpoint and placeholder page).
- Project log, coding plan, and plan README state Slice 0 is complete and point to Slice 1 (Auth).
- One consolidated commit was pushed to GitHub containing these changes.

---

### 2026-02-26 — Slice 1 (Auth), fixes, run guide, and push

- **Tool**: Cursor AI (agent)
- **Date**: 2026-02-26
- **Task**: Implement Slice 1 (Auth) end-to-end; fix runtime and dependency issues; add run guide and circular-import rule; log adjustments; push to GitHub.

**What the AI did**

- **Slice 1 implementation:** User model, migration (add users table), auth schemas (RegisterIn, LoginIn, UserOut, TokenWithUser), auth service (register_user, authenticate_user), deps (get_current_user), auth endpoints (register, login, logout, GET /me). API_CONTRACT.md updated. Backend tests (conftest with in-memory SQLite, test_auth with mocked password hashing). Frontend: api/client.ts, api/auth.ts, AuthContext, ProtectedRoute, LoginPage, SignupPage, DashboardPage, routes (/login, /signup, /dashboard, /). Decisions logged: login by email only, token in localStorage, GET /me for session restore, logout client-side.
- **Fixes:** (1) PEP 508: `pydantic[email]>={2.0.0}` → `pydantic[email]>=2.0.0` in pyproject.toml. (2) Circular import: removed model imports from app/db/base.py; added model imports in alembic/env.py so uvicorn starts and Alembic still discovers models. (3) Sign up 500: passlib/bcrypt 4.1+ incompatibility; replaced passlib with direct bcrypt in app/core/security.py (hash/verify with 72-byte truncation). (4) Frontend: SignupPage and LoginPage show “Something went wrong on the server. Please try again.” for 5xx.
- **Docs and rules:** docs/slice1-run-and-test.md (run backend/frontend, manual test, pytest, build, checklist, troubleshooting). .cursor/rules/avoid-circular-imports.mdc (do not import models in base.py; use alembic/env.py for migrations). plan/coding_plan.md and PROJECT_GUIDE.md updated for circular-import and model-discovery. docs/project-log.md and backend/docs/log.md updated for all fixes and verified run (user VinodGeorge24, Dashboard).
- **AI_USAGE:** Habit note added: log adjustments and notable AI-assisted changes here.

**Modifications / final result**

- User verified sign up and login (Dashboard “Hello, VinodGeorge24!”). User requested: (1) habit of logging adjustments to AI_USAGE.md, (2) push changes to GitHub per PUSH_TO_GITHUB.md. Push: root `.gitignore` had `lib/`, which ignored `frontend/src/lib/utils.ts`; added exception `!frontend/src/lib/` under Frontend. Staged, committed (message: Slice 1, fixes, run guide, rule, AI_USAGE, .gitignore), pushed with `git push -u origin main`. Commit 313dd4e.

### 2026-02-26 — Session timeout (30 minutes)

- **Tool**: Cursor AI (agent)
- **Task**: Add session timeout so the user is logged out after a period of time (30 minutes).
- **What was done:** Backend already had JWT expiry of 30 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`). Implemented frontend handling: API client response interceptor clears token and dispatches `auth:session-expired` on 401; AuthContext listens and sets user to null. Added `frontend/src/api/constants.ts` for `TOKEN_KEY` to avoid circular imports. Documented in API_CONTRACT, backend `.env.example`, docs/slice1-run-and-test.md, docs/project-log.md, backend/docs/log.md.

---

### 2026-03-02 — Slice 2 (Exercises CRUD)

- **Tool**: Cursor AI (agent)
- **Task**: Implement Slice 2 end-to-end (backend + frontend) for exercises CRUD.
- **Prompt/Request**: User approved a Slice 2 plan, asked for consistent logging and testing, then asked to proceed to frontend exercises UI once backend was verified.
- **Output**:
  - **Backend**: Added `Exercise` model + Alembic migration (`0483435f322d_add_exercises_table.py`), exercise schemas and service, `/api/v1/exercises` endpoints, and tests (`backend/app/tests/test_exercises.py`).
  - **Frontend**: Added `frontend/src/api/exercises.ts` and a protected `frontend/src/pages/ExercisesPage.tsx` with create/edit/delete UI; wired `/exercises` route and added Dashboard navigation.
  - **Verification**: Ran `pytest app/tests -q` (5 passed, warnings only) and `npm run build` (success). User manually sanity-checked login + exercises CRUD in the browser.
  - **Docs**: Added Slice 2 entries to `docs/project-log.md` and `backend/docs/log.md`.
- **Modifications**: The user validated the UI behavior manually (create/list/edit/delete exercises) and reported success. No additional feature scope was added beyond Slice 2.
- **Final Result**: Exercises CRUD works end-to-end behind auth, with tests and logs updated. `frontend_references/` remains the source of design inspiration for future UI expansion.

---

### 2026-03-22 — Pre-Slice-5 documentation consistency update

- **Tool**: Cursor AI (agent)
- **Task**: Audit and refresh project docs before starting Slice 5.
- **Prompt/Request**: "Go through all the files and ensure everything is updated ... we completed slice 4 ... prepare before slice 5."
- **Output**:
  - Marked Slice 4 complete in `plan/coding_plan.md` (including checkpoint pass wording).
  - Updated backend/project reference docs for consistency (`backend/docs/log.md`, `backend/README.md`, `PROJECT_GUIDE.md`, `docs/libraries-and-tools.md`).
  - Added log entries in `docs/project-log.md` and `logs/task-log.md` for the docs-prep pass.
- **Modifications**: Kept scope to documentation/status alignment only; no feature or API behavior changes were introduced.
- **Final Result**: Documentation now consistently reflects Slice 4 completion and readiness to start Slice 5.

---

### 2026-03-22 — Slice 5 (Workout templates)

- **Tool**: Cursor AI (agent)
- **Task**: Implement Slice 5 end-to-end with workout templates and template-to-log prefill.
- **Prompt/Request**: "Please complete slice 5 ... ensure the status and what we have done before that keeps working ... test and ensure there are no gaps and ambiguities ... push after it is complete."
- **Output**:
  - Added backend template models, migration, schemas, service, endpoints, and tests.
  - Implemented `GET /api/v1/templates/{template_id}/apply` to return a session-shaped prefill payload for Today&apos;s Log.
  - Added frontend template API helpers, a Templates page, route/navigation updates, and Today&apos;s Log template application support.
  - Updated slice status and contract/log docs to reflect Slice 5 completion.
- **Modifications**: Kept template application as a non-mutating prefill flow so it builds cleanly on the existing Slice 3 session save/update behavior rather than introducing a second session-creation path.
- **Final Result**: Users can create/edit/delete templates, use a template to prefill Today&apos;s Log, and save the resulting workout through the existing session flow. Existing backend tests, frontend build, migration, and browser verification all passed.

