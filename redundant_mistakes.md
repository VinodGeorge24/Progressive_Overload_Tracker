# Redundant Mistakes

Read this before starting any edit, bugfix, or new slice. This is a repo-specific list of mistakes that already happened and should not be repeated.

## UI Contrast And States

- Do not ship white or near-white buttons with washed-out, low-opacity, or hard-to-read text on dark pages.
- On light or white button backgrounds, button text must stay dark or black in idle, hover, focus, and disabled states unless there is a documented accessibility-safe exception.
- Do not use text fading or opacity as the main way to show whether a button is idle or active. Use border, background tone, shadow, or spacing instead.
- Check button states against the real page background, not only a component preview.
- For native `<select>` controls on dark cards or dark pages, explicitly style the opened option list so it does not render white or light text on a white dropdown background.
- Keep inputs readable on the dark theme. If an input needs a white background for visibility, its text, placeholder, and focus state must remain legible.
- Test action clusters at split-screen widths, not only at full desktop and phone widths. Do not switch dashboard or page-header CTAs into side-by-side layouts until the real available card/header width is proven wide enough, or labels will overlap.
- When a screen needs a wide table on narrow devices, keep the overflow contained inside the table region; do not let the entire page grow horizontally.

## Backend And Data Integrity

- Do not import app models in `backend/app/db/base.py`. Keep model discovery in `backend/alembic/env.py` to avoid circular imports.
- For SQLite development and tests, always enforce `PRAGMA foreign_keys=ON`. Do not assume cascades work unless that pragma is enabled.
- Do not load the same SQLAlchemy parent relationship twice with separate `joinedload(...)` chains. Use one `joinedload(...).options(...)` tree so collection rows do not duplicate.
- When deleting and recreating exercises in SQLite, verify that old workout history cannot reattach through orphan rows or primary-key reuse.
- In Pydantic schemas, avoid field and type shadowing such as `date: date | None`. Use an alias such as `date_type`.

## API, Validation, And Environment

- Keep dependency specifiers valid PEP 508 strings. Example: `pydantic[email]>=2.0.0`, not `pydantic[email]>={2.0.0}`.
- Do not reintroduce passlib-based runtime hashing in this repo. Direct `bcrypt` is the verified working path here.
- Development CORS must account for Vite fallback ports and localhost variants. Do not hard-code only one dev origin.
- If `npm run build` fails with `vite is not recognized`, verify that `npm install` was run in `frontend/` before changing code.
- Duplicate `exercise_id` values inside one template payload are a `400 Bad Request` with a clear message, not a `404`.
- For user-local workout dates, do not build `YYYY-MM-DD` with `toISOString().slice(0, 10)`. That is UTC-based and can roll late-evening local sessions into the next day. Use local date parts instead.

## Maintenance Rule

- Re-read this file before UI polish, backend data model changes, migration work, or slice handoff work.
- If a new mistake repeats or becomes a logged review finding, add it here with the specific repo-safe fix pattern.
