# Slice 8 And Post-MVP Cleanup Checklist

Date: 2026-04-16

## Safety

- Slice 7 backup branch created: `codex/slice-7-snapshot-2026-04-16`
- Snapshot source commit: `2303f06` (`docs: clarify project-log GitHub push wording`)
- Important: the repository had a dirty working tree when the snapshot branch was created, so the branch preserves the last committed state only, not the current uncommitted changes.

## Goal

Finish the last planned slice, then close the remaining repo-quality gaps so the application is easier to ship, demo, hand off, and maintain.

## Assumptions

- The app is functionally complete through Slice 7.
- Backend regression suite passes from `backend/`.
- Frontend production build passes from `frontend/`.
- The minimal export target is a user-owned JSON download first. CSV can stay optional unless it is explicitly needed for class/demo requirements.
- Deployment guidance should stay provider-neutral unless a hosting target is chosen.

## Phase A: Slice 8

### Task 1: Lock the export contract before coding

Checklist:
- Decide the endpoint shape: `GET /api/v1/export?format=json`
- Define the export payload to include:
  - current user profile metadata
  - exercises
  - workout sessions with nested workout exercises and sets
  - workout templates with nested template exercises
- Define attachment behavior:
  - `Content-Type: application/json`
  - `Content-Disposition: attachment; filename="progressive-overload-export-YYYY-MM-DD.json"`
- Keep ownership rules identical to the rest of the API: authenticated user only

Files:
- `API_CONTRACT.md`
- `plan/coding_plan.md`

Verification:
- Read the contract and confirm the export route, payload, and error behavior are fully specified.
- Expected outcome: no ambiguity remains about what the backend should return or what the frontend should download.

### Task 2: Implement the backend export endpoint

Checklist:
- Add a dedicated export service that gathers all user-owned data in one place.
- Add a route module for export instead of hiding export logic inside sessions.
- Reuse current ownership/auth patterns via `get_current_user`.
- Return a JSON attachment rather than plain inline JSON.

Files:
- `backend/app/services/export.py`
- `backend/app/api/v1/endpoints/export.py`
- `backend/app/api/v1/router.py`
- `backend/app/schemas/export.py`
- `API_CONTRACT.md`

Verification:
- `cd backend && python -m pytest app/tests/test_export.py -q`
- `cd backend && python -m pytest app/tests -q`
- Optional manual check:
  - run `uvicorn app.main:app --reload`
  - request `GET /api/v1/export?format=json` with a valid bearer token
- Expected outcome: authenticated users receive a downloadable JSON export; unauthenticated requests return `401`.

### Task 3: Add export regression coverage

Checklist:
- Test happy-path export for a user with exercises, sessions, sets, and templates.
- Test `401` when no token is present.
- Test that export only returns the current user's data.
- Assert attachment headers, not just status code.

Files:
- `backend/app/tests/test_export.py`

Verification:
- `cd backend && python -m pytest app/tests/test_export.py -q`
- Expected outcome: export behavior is locked down the same way auth, sessions, analytics, and templates are.

### Task 4: Add the frontend export action

Checklist:
- Create a small frontend API helper that downloads the export as a Blob.
- Add the primary export button to History first.
- If placement still feels weak, add a secondary export entry on Dashboard after History is working.
- Show clear loading and error states during download.

Files:
- `frontend/src/api/export.ts`
- `frontend/src/pages/HistoryPage.tsx`
- Optional follow-up: `frontend/src/pages/DashboardPage.tsx`

Verification:
- `cd frontend && npm run build`
- Manual browser QA:
  - log in
  - open `/history`
  - click Export
  - confirm a JSON file downloads
- Expected outcome: export is visible from a natural user flow and does not require direct API usage.

### Task 5: Write the real deployment/runbook docs

Checklist:
- Document the exact local-to-production path:
  - backend install
  - frontend install/build
  - environment variables
  - Alembic migrations
  - PostgreSQL requirement
  - static frontend hosting plus backend API hosting assumptions
- Keep the runbook simple and reproducible.
- Call out what is local-only in `infra/`.

Files:
- `README.md`
- `backend/README.md`
- `frontend/README.md`
- `infra/README.md`
- `docs/deployment-runbook.md`

Verification:
- Read each doc top to bottom and confirm the steps do not contradict each other.
- Expected outcome: a new developer can run or deploy the app without reverse-engineering the repo.

## Phase B: Post-MVP Cleanup Required For A Strong Finish

### Task 6: Restore a working frontend lint gate

Checklist:
- Add an actual ESLint config instead of leaving `npm run lint` broken.
- Exclude generated output like `dist/`.
- Start with practical React/TypeScript rules, not an overbuilt ruleset.

Files:
- `frontend/eslint.config.js` or `frontend/.eslintrc.cjs`
- `frontend/.eslintignore` if needed
- `frontend/package.json` only if the script or file globs need adjustment

Verification:
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- Expected outcome: the frontend has a real static-check command that passes in the repo.

### Task 7: Clean backend static-analysis failures and stale config

Checklist:
- Fix Ruff issues in `app/main.py`, `app/models/*.py`, and `app/services/sessions.py`.
- Convert Pydantic settings config to the non-deprecated v2 pattern.
- Replace naive UTC usage with timezone-aware UTC handling where practical.
- Remove stale runtime dependencies that are no longer used.

Files:
- `backend/app/main.py`
- `backend/app/models/exercise.py`
- `backend/app/models/set.py`
- `backend/app/models/template_exercise.py`
- `backend/app/models/user.py`
- `backend/app/models/workout_exercise.py`
- `backend/app/models/workout_session.py`
- `backend/app/models/workout_template.py`
- `backend/app/services/sessions.py`
- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/pyproject.toml`

Verification:
- `cd backend && python -m ruff check app`
- `cd backend && python -m pytest app/tests -q`
- Expected outcome: the backend passes its basic static-quality gate and no longer carries obvious deprecated/stale setup.

### Task 8: Close the remaining "should-have" UX gap around search and filtering

Checklist:
- Add exercise search/filter to the exercises library.
- Add lightweight filtering to History at minimum:
  - search by exercise name
  - optional date range filter
- Keep this scoped to existing data and routes; no new backend slice is required unless pagination/filtering on the server becomes necessary.

Files:
- `frontend/src/pages/ExercisesPage.tsx`
- `frontend/src/pages/HistoryPage.tsx`
- Optional helper: `frontend/src/lib/` or `frontend/src/utils/` if filtering logic needs extraction

Verification:
- `cd frontend && npm run build`
- Manual browser QA on long exercise/session lists
- Expected outcome: the shipped app satisfies more of the PRD "should-have" experience rather than stopping at raw CRUD lists.

### Task 9: Run a final end-to-end demo checklist and capture it

Checklist:
- Verify the main user flow in one pass:
  - sign up
  - log in
  - create exercises
  - create a template
  - apply the template in Today's Log
  - save a workout
  - edit the workout from History
  - open Progress analytics
  - export data
- Record final status in repo docs after verification.

Files:
- `docs/project-log.md`
- `logs/task-log.md`
- `README.md` if the status wording changes from "demo-ready" to "complete"

Verification:
- `cd backend && python -m pytest app/tests -q`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- Manual browser QA of the full flow
- Expected outcome: the repo has one explicit final verification pass instead of relying on scattered historical notes.

## Phase C: Optional If Time Remains

These items are useful, but they are not on the critical path to calling the application complete:

- Add frontend automated tests for auth and the main logging flow.
- Add CI so backend tests, Ruff, frontend lint, and frontend build run on every push.
- Add a help/FAQ or user guide page using the existing design reference.
- Add provider-specific deployment docs only after a hosting target is chosen.

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9

## Same-Session Execution Option

Use this if you want to keep momentum and implement immediately:

1. Finish Phase A end to end.
2. Run backend tests and frontend build.
3. Finish Tasks 6 and 7 before adding more polish.
4. Do Task 8 only after the static-quality gates are green.
5. End with Task 9 and a final push/hand-off pass.

## Batched Execution Option

Use this if you want smaller review checkpoints:

1. Batch 1: Tasks 1-3
2. Batch 2: Tasks 4-5
3. Batch 3: Tasks 6-7
4. Batch 4: Tasks 8-9

