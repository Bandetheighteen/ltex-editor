# LaTeX Editor

## What This Is

A lightweight, crash-free IDE for LaTeX that provides a side-by-side view with LaTeX code on the left and a live PDF preview on the right. The application is distributed in two forms: a highly optimized native desktop app and a web-based version that can be opened in the browser.

## Core Value

A stable, bug-free, and high-performance LaTeX editing experience that never shuts down unexpectedly and reliably renders PDFs side-by-side.

## Current State (v1.0)
The application has successfully migrated to a dual-target architecture:
1. **Tauri Native App:** High-performance desktop application with native `pdflatex` compilation and SyncTeX support safely executing via Rust child processes.
2. **Express Web Server:** Robust Node.js backend serving the same frontend with HTTP endpoints for compile and SyncTeX, featuring strict timeout constraints to prevent zombie processes.
The buggy Electron architecture has been entirely replaced and obsolete files removed.

## Next Milestone Goals
*(Waiting for new milestone definition)*

## Requirements

### Validated

- ✓ Basic side-by-side layout (editor left, PDF right)
- ✓ Integration with local LaTeX compiler (`pdflatex`)
- ✓ SyncTeX support (PDF to source mapping)
- ✓ Re-architect the native app using Tauri (Rust) for performance and stability
- ✓ Implement a stable Node.js backend for the web version
- ✓ Fix memory leaks and unexpected shutdowns (eliminated via timeouts & Tauri)
- ✓ Maintain a single frontend codebase (`public/`) shared across both Native and Web apps

### Active

- [ ] (No active requirements - v1.0 complete)

### Out of Scope

- [Cloud LaTeX compilation] — Compilation will remain local to rely on the user's local MiKTeX/TeX Live installation.
- [Full IDE features (e.g. Git integration, heavy extensions)] — Keeping it a "small IDE-like setup" as requested, to preserve performance.

## Context

- The initial goal was migrating away from a buggy Node.js/Electron implementation.
- This was achieved by introducing Tauri (v1.0 milestone) and wrapping compilation processes in strict timeouts.
- The user's system runs Windows and requires local TeX distribution in PATH.

## Constraints

- **Tech Stack**: Native App: Tauri (Rust). Web Server: Node.js (Express). Frontend: HTML/JS/CSS.
- **Dependency**: Requires local LaTeX distribution (`pdflatex`, `synctex`) installed on the host system.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Tauri for Native App | Solves the memory and shutdown issues of Electron while remaining fast | Validated (v1.0) |
| Express Web Backend | Chosen for web target, adding strict 10s timeouts to prevent hanging | Validated (v1.0) |
| Shared Frontend | `public` folder is served by both Tauri and the Web backend via a `BackendAdapter` | Validated (v1.0) |

---
*Last updated: 2026-10-08 after v1.0 milestone completion*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
