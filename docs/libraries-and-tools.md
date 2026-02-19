# Libraries and Tools Reference

Scan of every folder, doc, and code file for what we **use**, **declare**, or **could install**. From general (Python, Node) down to specific packages.

---

## 1. Runtime / System (General)

| Item | Where mentioned | Notes |
|------|-----------------|--------|
| **Python** | PRD, README, backend/README, pyproject.toml, CODING_STANDARDS | Required. Version **3.9+** (pyproject: `requires-python = ">=3.9"`). |
| **Node.js** | README, frontend/README, frontend/package.json | For frontend. **18+** (frontend/README). |
| **PostgreSQL** | PRD, README, backend/README, DATA_MODEL, infra/docker-compose | Primary DB. Optional for dev (SQLite default). |
| **SQLite** | backend config default, backend/README, session.py | Default dev DB (`sqlite:///./workout_tracker.db`). |
| **Git** | PRD, CODING_STANDARDS | Version control. |
| **GitHub** | PRD | Hosting. |
| **pip** | README, backend/README | Python package installer. |
| **poetry** | backend/README | Optional alternative to pip. |
| **npm** / **yarn** / **pnpm** | README, frontend/README | Frontend package managers. |
| **Docker** | infra/docker-compose.yml, infra/README | Used only for Postgres locally. |
| **Docker Compose** | infra/ | `docker compose up -d` in infra/. |

---

## 2. Backend (Python) — Declared in pyproject.toml

### Production dependencies

| Package | Version (min) | Purpose |
|---------|----------------|---------|
| **fastapi** | 0.104.0 | Web framework. |
| **uvicorn[standard]** | 0.24.0 | ASGI server. |
| **sqlalchemy** | 2.0.0 | ORM. |
| **alembic** | 1.12.0 | DB migrations. |
| **pydantic** | 2.0.0 | Validation/schemas. |
| **pydantic-settings** | 2.0.0 | Settings from env (loads `.env`). |
| **python-jose[cryptography]** | 3.3.0 | JWT encode/decode. |
| **passlib[bcrypt]** | 1.7.4 | Password hashing. |
| **python-multipart** | 0.0.6 | Form/multipart for FastAPI. |
| **psycopg2-binary** | 2.9.9 | PostgreSQL driver. |

### Optional dev dependencies

| Package | Version (min) | Purpose |
|---------|----------------|---------|
| **pytest** | 7.4.0 | Tests. |
| **pytest-asyncio** | 0.21.0 | Async tests. |
| **httpx** | 0.25.0 | HTTP client (e.g. TestClient). |
| **black** | 23.9.0 | Formatter. |
| **ruff** | 0.1.0 | Linter. |
| **mypy** | 1.6.0 | Type checking. |

### Build

| Package | Purpose |
|---------|---------|
| **setuptools** | >=61.0, build backend. |
| **wheel** | Build. |

---

## 3. Backend — Used in code (imports)

All of these are satisfied by pyproject.toml except stdlib:

- **fastapi** (FastAPI, APIRouter, CORSMiddleware)
- **pydantic_settings** (BaseSettings) — from pydantic-settings
- **sqlalchemy** (create_engine, sessionmaker, declarative_base, etc.)
- **alembic** (context)
- **jose** (JWTError, jwt) — from python-jose
- **passlib.context** (CryptContext) — from passlib[bcrypt]
- **logging**, **sys**, **datetime**, **typing** — stdlib

No extra packages are imported that are not already in pyproject.toml.

---

## 4. Backend — Mentioned in docs but not in pyproject

| Item | Where | Status |
|------|--------|--------|
| **python-dotenv** | PRD (“use python-dotenv or equivalent”) | Not installed. **pydantic-settings** loads `.env` (equivalent). Optional to add if you want explicit dotenv elsewhere. |

---

## 5. Frontend (Node/npm) — Declared in package.json

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | ^18.2.0 | UI. |
| **react-dom** | ^18.2.0 | React DOM renderer. |
| **react-router-dom** | ^6.20.0 | Routing. |
| **axios** | ^1.6.0 | HTTP client for API. |
| **tailwindcss** | ^4.2.0 | Utility-first CSS framework. |
| **@tailwindcss/vite** | ^4.2.0 | Tailwind Vite plugin. |
| **class-variance-authority** | ^0.7.1 | Component variant styling (shadcn). |
| **clsx** | ^2.1.1 | Conditional class names (shadcn). |
| **tailwind-merge** | ^3.5.0 | Merge Tailwind classes (shadcn). |
| **lucide-react** | ^0.574.0 | Icons (shadcn default). |
| **radix-ui** | ^1.4.3 | Primitives for shadcn components. |
| **tw-animate-css** | ^1.4.0 | Animations for shadcn. |

### DevDependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/react** | ^18.2.0 | React types. |
| **@types/react-dom** | ^18.2.0 | React DOM types. |
| **@types/node** | ^25.3.0 | Node types (path resolution). |
| **@vitejs/plugin-react** | ^4.2.0 | Vite React plugin. |
| **vite** | ^5.0.0 | Build tool. |
| **shadcn** | ^3.8.5 | CLI for adding shadcn/ui components. |
| **eslint** | ^8.54.0 | Linting. |
| **prettier** | ^3.1.0 | Formatting. |
| **typescript** | ^5.3.0 | TypeScript. |

---

## 6. Frontend — Mentioned in docs (TBD or optional)

| Item | Where | Status |
|------|--------|--------|
| **Tailwind CSS** | PRD, frontend | **Installed.** Primary styling. Use with shadcn/ui for select components. |
| **shadcn/ui** | PRD, frontend | **Installed.** Used for some UI components (buttons, inputs, cards, etc.); add via `npx shadcn@latest add <component>`. Custom components may use Tailwind directly. |
| **CSS Modules** | Alternative for custom components | No extra package; use `*.module.css` with Vite if needed. |
| **Charts (Python)** | PRD, ARCHITECTURE | Charts generated in backend with Python (matplotlib, Plotly). Frontend displays chart images. No Chart.js/Recharts for MVP. |

---

## 7. Infra / Docker

| Item | Where | Purpose |
|------|--------|---------|
| **postgres:15-alpine** | infra/docker-compose.yml | Postgres image for local DB. |
| **Dockerfile** (backend) | Referenced in commented docker-compose | Not present in repo; would be needed if you uncomment backend service. |

---

## 8. Documentation / Code quality (mentioned)

| Item | Where | Purpose |
|------|--------|---------|
| **Doxygen** | CODING_STANDARDS | Doc generation (optional). |
| **Sphinx** | CODING_STANDARDS | Python docs (optional). |

Not required for the project; only “you may use them” in coding standards.

---

## 9. Summary: “Could install” (not yet declared)

- **Backend**: `python-dotenv` (optional; pydantic-settings already loads `.env`).
- **Backend charts (required for Slice 4)**: Add **matplotlib** or **Plotly** to `backend/pyproject.toml` before implementing analytics/charts. Not currently in pyproject.toml. Example: `matplotlib>=3.7.0` or `plotly>=5.18.0`. See `plan/coding_plan.md` (Libraries and install checklist).
- **Frontend styling**: Tailwind CSS and shadcn/ui are installed. Add shadcn components via `npx shadcn@latest add <component>`.
- **Charts**: Python-generated in backend (matplotlib/Plotly); frontend displays chart images. See PRD and ARCHITECTURE.
- **Backend (if you add backend Docker image)**: Dockerfile and any base image (e.g. `python:3.11-slim`).

---

## 10. One-line install reference

**Backend (from repo root):**
```bash
cd backend && pip install -e .
# optional dev:
pip install -e ".[dev]"
```

**Frontend:**
```bash
cd frontend && npm install
```

**Infra (Postgres only):**
```bash
cd infra && docker compose up -d
```
