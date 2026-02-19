# Progressive Overload Tracker — Copy/Paste Guide

This document describes what every folder and file in the project does. Use it as a quick reference when navigating or explaining the codebase.

---

## Root Level

| File / Folder | Purpose |
|---------------|---------|
| **README.md** | Main project overview: what the app does (workout tracking, progressive overload), problem it solves, features, tech stack (Python/FastAPI backend, React frontend with Tailwind and shadcn/ui, PostgreSQL), getting started (clone, copy .env.example to .env, backend/frontend setup), project structure summary, links to PRD, API_CONTRACT, DATA_MODEL, CODING_STANDARDS, AI_USAGE. **Reference PRD.md first** — it is the source of truth. |
| **PRD.md** | Product Requirements Document: product overview, product scope (single web app, one session per day, per-set weight/reps, no plateau/recommendations in scope), problem statement, user stories, core features (MVP, primary screens, should-have), definition of done, success metrics, tech stack (Python charts in backend, Option A line charts), analytics/research (per-exercise progress, no plateau), project-wide terminology (weight/reps per set). |
| **API_CONTRACT.md** | Contract between frontend and backend: base URL, auth headers (Bearer JWT), terminology (weight/reps per set), endpoints (auth, exercises, sessions with 409 for duplicate date, analytics progress with set_number filter; plateaus/recommendations future), resource ownership and edge cases (404, 409, 400, 422). See "Source of Truth" for OpenAPI alignment. |
| **DATA_MODEL.md** | Database structure: project-wide terminology (weight = lbs per set, reps = per set), entities (users, exercises, workout_sessions one per user per day, workout_exercises, sets, templates), calculated fields (volume; 1RM future), indexes including unique (user_id, date), units (lbs only), future considerations. |
| **CODING_STANDARDS.md** | Coding standards for the senior project: file headers (module docstrings), function docs (UNIX man-page style), code comments, namespaces, tabs/spacing (4 spaces), source control (Git), testing, constants/variables naming (e.g. constants CAPITAL, functions UpperCase), functions/classes rules, code flow, miscellaneous (no dead code, handle exceptions). |
| **AI_USAGE.md** | Log of AI assistance for academic honesty: date, tool, task, prompt, output, modifications, final result. Template with one sample entry; add entries as AI is used. |
| **.cursorrules** | Cursor IDE rules: project context (senior project, FastAPI + frontend), “documentation first” (PRD, API_CONTRACT, DATA_MODEL, README), code organization (backend models/schemas/api/v1/endpoints/services/core/db, frontend pages/components/api), principles (per-exercise progress/visualization correctness, security, data integrity, API contract, error handling), testing, migrations (Alembic only), code style (CODING_STANDARDS + PEP 8), what not to do, Project Structure Boundaries (no new top-level folders or dependencies without updating docs), AI usage logging. |
| **.cursorignore** | Files/folders Cursor should ignore (dependencies, build artifacts, DB files, logs, .env, IDE, OS files, coverage, docs build, large media). |
| **.gitignore** | Git ignore: Python cache/build/venv, .env, IDEs, DB files, logs (except logs/README.md), testing artifacts, frontend node_modules/build, uploads, secrets. |
| **.env.example** | Template for environment variables. Copy to .env and configure (DATABASE_URL, SECRET_KEY, VITE_API_URL). |
| **ARCHITECTURE.md** | Short architecture doc: folder responsibilities, data flow (frontend → API → service → db), charts generated in backend with Python and displayed by frontend, key rules (no business logic in routes, endpoints delegate to services, auth via deps), error format. |

---

## backend/

| Item | Purpose |
|------|---------|
| **backend/** | Python FastAPI application: all business logic, data persistence, and REST API. |
| **backend/README.md** | Backend-specific readme: tech stack (FastAPI, SQLAlchemy, Alembic, JWT, Pydantic, PostgreSQL/SQLite), setup (venv, pip install -e ., .env, alembic upgrade head, uvicorn), project structure (app/main, api, core, db, models, schemas, services, tests; alembic; pyproject.toml), dev workflow (feature flow, DB changes, pytest), API docs (Swagger/ReDoc), key files, env vars. |
| **backend/pyproject.toml** | Project config: build (setuptools), project name/version/description, Python >=3.9, dependencies (fastapi, uvicorn, sqlalchemy, alembic, pydantic, pydantic-settings, python-jose, passlib[bcrypt], python-multipart, psycopg2-binary), optional dev (pytest, pytest-asyncio, httpx, black, ruff, mypy), package "app", black/ruff line-length 100, mypy settings. |
| **backend/alembic.ini** | Alembic config: script_location=alembic, prepend_sys_path=., sqlalchemy.url placeholder, version_path_separator=os, logging config for root/sqlalchemy/alembic. |
| **backend/alembic/** | Directory for database migration scripts and env. |
| **backend/alembic/env.py** | Alembic environment: imports Base from app.db.base, overrides sqlalchemy.url from app.core.config settings, sets target_metadata = Base.metadata, defines run_migrations_offline/online and runs one based on context. Model imports are commented (to be added when models exist). |
| **backend/alembic/script.py.mako** | Mako template for new migration files: revision id, down_revision, upgrade/downgrade stubs. |
| **backend/alembic/versions/** | Where migration version files live. Currently only .gitkeep (no migrations yet). |
| **backend/app/** | Main application package. |
| **backend/app/__init__.py** | Package marker (empty docstring). |
| **backend/app/main.py** | FastAPI entry point: creates app with title/description/version, adds CORS middleware (from settings), includes v1 router with prefix /api/v1, defines GET / and GET /health. |
| **backend/app/core/** | Config, security, logging. |
| **backend/app/core/__init__.py** | Package marker. |
| **backend/app/core/config.py** | Pydantic Settings: DATABASE_URL (default SQLite), SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, CORS_ORIGINS, ENVIRONMENT, DEBUG, LOG_LEVEL, API_V1_PREFIX; loads from .env. |
| **backend/app/core/logging.py** | Configures root logger with format, date format, StreamHandler; gets module logger; sets uvicorn.access to WARNING. |
| **backend/app/core/security.py** | Password hashing (passlib/bcrypt): verify_password, get_password_hash; JWT (python-jose): create_access_token, decode_access_token using settings. |
| **backend/app/db/** | Database engine and session. |
| **backend/app/db/__init__.py** | Package marker. |
| **backend/app/db/base.py** | SQLAlchemy declarative Base; commented imports for future models (User, Exercise, WorkoutSession, etc.) for Alembic discovery. |
| **backend/app/models/** | SQLAlchemy database models; exists with __init__.py and TODO imports. Add models here; import in db/base for Alembic discovery. |
| **backend/app/db/session.py** | create_engine from settings.DATABASE_URL (with sqlite check_same_thread), SessionLocal sessionmaker, get_db() generator dependency for FastAPI. |
| **backend/app/api/** | API router grouping: deps.py (shared dependencies), v1/router.py, v1/endpoints/ (the one true router home). |
| **backend/app/schemas/__init__.py** | Pydantic schemas package; __all__ = []. |
| **backend/app/services/__init__.py** | Business logic package (analytics, progressive overload, calculations); __all__ = []. |
| **backend/app/tests/__init__.py** | Tests package; __all__ = []. |

---

## frontend/

| Item | Purpose |
|------|---------|
| **frontend/** | User interface application (React + Vite + Tailwind + shadcn/ui). |
| **frontend/README.md** | Frontend readme: tech stack (Vite + React + React Router, Tailwind CSS, shadcn/ui for select components), prerequisites (Node 18+, backend running), install (npm/yarn/pnpm), env (VITE_API_URL), dev server, suggested structure (pages, components/ui for shadcn, api, lib, hooks, utils, types), workflow, principles (separation of concerns, api abstraction, type safety, error handling, loading states, responsive), API integration example (uses /api/v1/), auth (JWT storage), build. |
| **frontend/package.json** | Project name/version, type "module", scripts (dev, build, preview, lint, format), dependencies (react, react-dom, react-router-dom, axios, tailwindcss, shadcn-related: clsx, tailwind-merge, lucide-react, etc.), devDependencies (types, vite, @vitejs/plugin-react, @tailwindcss/vite, eslint, prettier, typescript). |
| **frontend/src/** | Source code. |
| **frontend/src/pages/** | Placeholder for page components (e.g. Login, Dashboard, WorkoutLog, History, Analytics); currently .gitkeep. |
| **frontend/src/components/** | Reusable UI components; `ui/` subfolder holds shadcn/ui components. |
| **frontend/src/api/** | Placeholder for API helper functions that call backend; .gitkeep. |

---

## frontend_references/

| Item | Purpose |
|------|---------|
| **frontend_references/** | Screen-level design references (not part of the built app). Each subfolder has code.html and optionally a screen image. Use for inspiration only; implement in React with Tailwind and shadcn/ui. See frontend_references/README.md for folder map and per-screen analysis. |
| **frontend_references/README.md** | Folder map (screen to path), design tokens (primary #137fec, background-dark #101922, Inter), and short analysis per screen for the agent. |
| **login_page_-_lift_tracker/** | Login: card layout, email/password, Forgot password, LIFT TRACKER branding. |
| **signup_page_-_lift_tracker/** | Signup: username, email, password, confirm, terms; password checklist. |
| **main_dashboard_-_lift_tracker/** | Dashboard: greeting, Log Today's Workout, stats grid, progress chart placeholder, recent sessions table. |
| **today's_log_-_lift_tracker/** | Today's log: add exercise, sets table (set #, weight, reps), notes, Save/Cancel; Start from Template. |
| **workout_history_-_lift_tracker/** | History: search, date filter, Export, table (date, exercises, duration, volume), view/edit/delete, pagination. |
| **progress_analytics_-_lift_tracker/** | Analytics: exercise selector, metric/set filter, chart area, session history table. |
| **workout_templates_-_lift_tracker/** | Templates: grid of template cards, Create Template, Use/Edit. |
| **exercises_library_-_lift_tracker/** | Exercises: table (name, muscle group, created), search/filter, Create Exercise. |
| **app_settings_-_lift_tracker/** | Settings: theme, units, date format, profile, change password, export data, danger zone. |
| **help_&_faq_-_lift_tracker/** | Help and FAQ: search, topic chips, accordion FAQ, support CTA. |

---

## docs/

| Item | Purpose |
|------|---------|
| **docs/** | Longer-form documentation (deliverables, research, presentations). |
| **docs/README.md** | Describes docs folder: weekly-reports/ (format and purpose), research-notes.md, screenshots/ (usage and naming). |
| **docs/research-notes.md** | Research angle: workout tracking and per-exercise visualization (volume, weight/reps per set), chart approach (Python backend, Option A), volume calculations; 1RM and plateau/recommendations in Future section. |
| **docs/weekly-reports/** | For weekly progress reports (e.g. week-YYYY-MM-DD.md); .gitkeep only for now. |
| **docs/screenshots/** | For UI/chart/workflow screenshots; .gitkeep only for now. |

---

## infra/

| Item | Purpose |
|------|---------|
| **infra/** | Infrastructure and deployment configuration. |
| **infra/docker-compose.yml** | Defines service `db`: postgres:15-alpine (workout_user, workout_password, workout_tracker), port 5432, volume for data, healthcheck. Docker is DB-only, dev-only; backend/frontend run locally; production uses hosted Postgres. See infra/README.md. |
| **infra/README.md** | Usage: docker compose up -d to start Postgres. Clarifies compose is for local dev only; production uses hosted Postgres. |

---

## logs/

| Item | Purpose |
|------|---------|
| **logs/** | Project memory: informal, chronological task tracking. |
| **logs/README.md** | Purpose of logs folder (task tracking, decisions, WIP), describes task-log.md and logging guidelines. |
| **logs/task-log.md** | Chronological log: sample entry for project init (structure, docs, config, backend in progress, frontend pending). Add new entries as work progresses. |

---

## Quick Reference: Where to Put New Work

- **New feature** → complete all 6 layers (DB, API, Service, Contract, Test, Frontend) in order; no skipping. See .cursorrules and ARCHITECTURE.md.
- **New API endpoint** → backend: add route in `app/api/v1/endpoints/`, logic in `app/services/`, include in `app/api/v1/router.py`; update `API_CONTRACT.md`.
- **New database table/column** → backend: add or edit model (under `app/models/` when created), then `alembic revision --autogenerate` and `alembic upgrade head`; keep `DATA_MODEL.md` in sync.
- **New frontend page** → `frontend/src/pages/`, route in router, API calls in `frontend/src/api/`.
- **New reusable UI piece** → `frontend/src/components/`.
- **Weekly update** → `docs/weekly-reports/week-YYYY-MM-DD.md`.
- **Research/algorithm notes** → `docs/research-notes.md`.
- **Task done / in progress** → `logs/task-log.md`.
- **AI assistance** → `AI_USAGE.md`.

---

*Generated from the Progressive_Overload_Tracker codebase. For behavior and requirements, see PRD.md and API_CONTRACT.md.*
