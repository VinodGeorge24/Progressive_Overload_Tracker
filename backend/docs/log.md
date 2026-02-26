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
