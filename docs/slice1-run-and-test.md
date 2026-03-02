# Slice 1: Run and test guide

How to run the app and verify Slice 1 (Auth) end-to-end. See [plan/coding_plan.md](../plan/coding_plan.md) for the full Slice 1 scope.

**Note on frontend look:** Slice 1 auth pages (Login, Signup, Dashboard) are built for function and checkpoint only. They do not yet apply the full [frontend_references/](../frontend_references/) layout or design tokens (e.g. primary `#137fec`, dark background, Inter, sidebar on dashboard). Applying reference styling is planned for later (e.g. Slice 6 polish or when touching those pages again); the references are in `login_page_-_lift_tracker/`, `signup_page_-_lift_tracker/`, `main_dashboard_-_lift_tracker/`.

---

## Prerequisites

- Python 3.9+ with `backend` dependencies installed: `cd backend && pip install -e .`
- Node 18+ with frontend deps: `cd frontend && npm install`
- Optional: PostgreSQL via `docker compose -f infra/docker-compose.yml up -d` and `DATABASE_URL` in `backend/.env`. If not set, backend uses default SQLite.

---

## 1. Backend

**Terminal 1 (backend):**

```bash
cd backend
# If using Postgres: ensure .env has DATABASE_URL=postgresql://...
# Apply migrations if needed:
alembic upgrade head
# Start API
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/health → `{"status":"healthy"}`

---

## 2. Frontend

**Terminal 2 (frontend):**

```bash
cd frontend
# Ensure .env or .env.local has VITE_API_URL=http://localhost:8000 (copy from .env.example if needed)
npm run dev
```

- App: http://localhost:5173 (or the URL Vite prints)

---

**Session timeout:** Access tokens expire after 30 minutes. If the token is expired or invalid, the next API call returns 401; the client then clears the token and the app shows as logged out (redirect to login when on a protected page).

---

## 3. Manual test (Slice 1 checkpoint)

1. **Welcome** — Open app; you should see “Progressive Overload Tracker” and Log in / Sign up.
2. **Sign up** — Click Sign up, enter email, username, password (≥8 chars). Submit → redirect to Dashboard with “Hello, &lt;username&gt;”.
3. **Log out** — Click Log out → back to welcome; Log in / Sign up again.
4. **Log in** — Log in with same email/password → Dashboard again.
5. **Protected route** — While logged in, open http://localhost:5173/dashboard → Dashboard. Log out, open http://localhost:5173/dashboard → redirect to Login.
6. **API auth** — In browser DevTools or Postman:
   - `GET http://localhost:8000/api/v1/auth/me` with no header → 401.
   - After login, copy token from localStorage (`access_token`), then `GET http://localhost:8000/api/v1/auth/me` with `Authorization: Bearer <token>` → 200 and user JSON.

---

## 4. Backend tests

```bash
cd backend
pytest app/tests -v
```

- Expect at least: `test_register_then_login_returns_token`, `test_me_requires_auth`, `test_me_with_token_returns_user` (all in `app/tests/test_auth.py`).

---

## 5. Frontend build

```bash
cd frontend
npm run build
```

- Should complete without errors.

---

## Quick checklist (did I miss anything?)

| Step | Required for “running” | Where |
|------|------------------------|--------|
| `pip install -e .` in backend | Yes (once) | Prerequisites |
| `npm install` in frontend | Yes (once) | Prerequisites |
| `alembic upgrade head` | Yes if DB is new or changed | § 1 Backend |
| `uvicorn app.main:app --reload` | Yes | § 1 Backend |
| `npm run dev` in frontend | Yes | § 2 Frontend |
| Manual test (welcome → sign up → login → dashboard) | Yes for checkpoint | § 3 |
| `pytest app/tests -v` | Recommended | § 4 |
| `npm run build` | Recommended | § 5 |

If you ran backend + frontend and completed sign up and login and saw the Dashboard (e.g. “Hello, &lt;username&gt;!”), you have not missed anything required. Sections 4 and 5 are for automated verification.

---

## Troubleshooting

- **Backend: "circular import" / "partially initialized module"** — Do not add model imports in `app/db/base.py`. Models are imported only in `alembic/env.py` for migrations and elsewhere (deps, services, endpoints) as needed. See `.cursor/rules/avoid-circular-imports.mdc`.
- **Frontend: 404 or CORS** — Ensure `VITE_API_URL` points at the backend (e.g. http://localhost:8000) and backend is running.
- **401 on /auth/me** — Token may be missing or expired; log in again to get a new token.
