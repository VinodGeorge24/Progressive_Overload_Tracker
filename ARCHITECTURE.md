# Architecture

Short overview of the project structure and data flow for onboarding and agent steering.

## Folder Responsibilities

### Backend (`backend/app/`)

| Folder | Responsibility |
|--------|----------------|
| `models/` | SQLAlchemy database models only |
| `schemas/` | Pydantic schemas for request/response validation |
| `api/v1/endpoints/` | FastAPI route handlers (the one true router home); thin, delegate to services |
| `services/` | Business logic, calculations, analytics |
| `core/` | Configuration, security, logging |
| `db/` | Database session management |

### Frontend (`frontend/src/`)

| Folder | Responsibility |
|--------|----------------|
| `pages/` | Page components and routing (React Router) |
| `components/` | Reusable UI components; `components/ui/` holds shadcn/ui components |
| `lib/` | Utilities (e.g. `utils.ts` for `cn()`) |
| `api/` | Functions that call backend endpoints |

## Data Flow

```
Frontend (pages/components)
    → api/ helpers (fetch)
    → Backend API (app/api/v1/endpoints/*)
    → services/ (business logic)
    → db/ (session, models)
    → Database
```

No business logic in routes. Endpoints are thin; they delegate to services.

Charts are generated in the backend with Python (e.g. matplotlib/Plotly); the frontend displays the chart images.

## Key Rules

1. **No business logic in routes** — endpoints validate input, call services, return response.

2. **Endpoints delegate to services** — all calculations, analytics, and domain logic live in `services/`.

3. **Auth via deps** — when implemented, use `app.api.deps.get_current_user` in protected routes.

4. **Error format** — consistent error response shape as defined in API_CONTRACT.md.

## Feature Development Flow

Each feature must complete these layers in order:

1. DB layer — models, migration, apply
2. API layer — endpoints, schemas
3. Service layer — business logic
4. Contract update — API_CONTRACT.md
5. Minimal test — at least one test
6. Frontend integration — page/component + API helper

No skipping layers. No "we'll fix that later."
