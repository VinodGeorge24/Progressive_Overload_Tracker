# AI Usage Log

This document records any AI assistance used in the development of this project, as required for academic honesty and transparency.

## Purpose

This log tracks:
- What AI tools were used
- When they were used
- What assistance was provided
- How the output was modified or integrated

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

