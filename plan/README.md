# Plan folder

This folder holds the **coding plan** for the Progressive Overload Tracker so the agent (and you) can implement the app **by slice** without re-explaining scope each time.

## Contents

| File | Purpose |
|------|--------|
| **coding_plan.md** | Full slice-by-slice plan: Slices 0–7, substeps, checkpoints, design references (Stitch + frontend_references), libraries checklist, implementation notes. **Read this when starting or advancing a slice.** |

**Status:** Slice 0 complete (see [docs/project-log.md](../docs/project-log.md) 2026-02-19). Next: Slice 1 (Auth).

For the full screen-to-folder map and design tokens, see [frontend_references/README.md](../frontend_references/README.md).

## Global memory (hybrid approach)

For **continuity across sessions** and **lower token usage**, a **global memory** rule is used so Cursor has short context in every chat without re-sending the full plan or PRD.

- **Where:** User-level Cursor rules: `~/.cursor/rules/global-memory.mdc`  
  - On Windows: `C:\Users\<you>\.cursor\rules\global-memory.mdc`
  - Cursor injects rules from this path into every chat (see [Cursor IDE Integration](https://deepwiki.com/thedotmack/claude-mem/4.2-cursor-ide-integration) for how context injection works).
- **What it contains:** A short "Current state" section: current project, current slice/phase, last session summary (1–3 bullets), optional key decisions.
- **When to update:** At **end of a session** or when **switching project or slice**. You or the agent can update the "Current state" block so the next chat knows where things stand.
- **Why hybrid:** No worker or hooks required. You (or the agent at your request) update the file manually; Cursor always loads it, so you get memory and efficiency without running claude-mem or another service.

**Token efficiency:** Keep `global-memory.mdc` short. Use `plan/coding_plan.md` only when starting a new slice or when the agent needs the full step list. That way most turns get only the small memory rule instead of the full plan.

**End-of-session reminder:** Before closing Cursor or starting a new chat, update `~/.cursor/rules/global-memory.mdc` (the "Current state" section) so the next chat has context without re-reading the full plan.
