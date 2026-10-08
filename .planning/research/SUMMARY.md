# Project Research Summary

**Project:** LaTeX Editor
**Domain:** Dual-target IDE (Native + Web)
**Researched:** 2026-10-08
**Confidence:** HIGH

## Executive Summary

The project requires a lightweight, stable dual-target application that functions both as a highly optimized native desktop app and as a web-accessible server. Previous implementations relied heavily on Electron and Node.js which suffered from severe memory issues and process shutdowns, particularly when managing intensive local processes like `pdflatex`.

The recommended approach is to adopt Tauri v2 using Rust for the native shell to ensure memory safety, minimal footprint, and stable process execution. For the shared backend logic and web server, Rust (using Axum) or Node.js (Fastify) can be used, but keeping a unified language (Rust) or a highly-stable Node backend is key. The frontend should remain a standard HTML/CSS/JS SPA (e.g. React/Vite) that interacts with either Tauri IPC or REST APIs via a common abstraction layer.

Key risks involve the divergence between Tauri's IPC and Web API interfaces, and properly managing zombie processes from the local LaTeX compiler.

## Key Findings

### Recommended Stack

Tauri v2 provides a minimal footprint alternative to Electron by utilizing the OS native webviews. 

**Core technologies:**
- **Tauri v2 (Rust)**: Native shell — ensures ultra-low memory usage and crash-free execution.
- **Node.js (Fastify) or Rust (Axum)**: Web server target — to serve the standalone web version.
- **React / Vanilla JS + Vite**: Frontend — fast, lightweight UI capable of running in both targets.
- **Monaco Editor / CodeMirror**: Editor — robust syntax highlighting for LaTeX.

### Expected Features

**Must have (table stakes):**
- Real-time side-by-side editing and PDF preview.
- Local LaTeX compilation (`pdflatex` integration).
- SyncTeX support (click PDF to go to source line and vice-versa).

**Should have (competitive):**
- Unified Adapter Layer: code written once runs on Native IPC and Web HTTP flawlessly.
- Auto-save and auto-compile on debounce.

**Defer (v2+):**
- Cloud compilation fallback.
- Advanced Git integration.

### Architecture Approach

The architecture relies on a "Shared Core / Dual Shell" pattern.

**Major components:**
1. **Shared Frontend SPA** — renders the UI (Editor, PDF viewer).
2. **Platform Adapter Layer** — abstracts backend commands. If `window.__TAURI__` is present, it uses IPC; otherwise, it uses `fetch()`.
3. **Native Shell (Tauri)** — Rust backend that executes `pdflatex` via `std::process::Command`.
4. **Web Shell (Node/Rust Server)** — HTTP backend that executes `pdflatex` and serves the SPA.

### Critical Pitfalls

1. **Zombie Processes** — `pdflatex` hangs or is orphaned. *Avoid by carefully managing child process lifecycles and timeouts in Rust/Node.*
2. **API Divergence** — Native and Web backends get out of sync. *Avoid by defining a strict contract (`compile`, `synctex`) and testing both.*
3. **Blocking the UI thread** — *Avoid by ensuring compilation is fully asynchronous in both IPC and HTTP routes.*

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Frontend & Adapter Layer
**Rationale:** The frontend already exists in `public/`. We need to adapt it to use an abstraction layer so it doesn't assume it's running in Node or Electron.
**Delivers:** A shared frontend package ready to be consumed by both targets.
**Addresses:** Basic side-by-side layout, Editor logic.
**Avoids:** API Divergence.

### Phase 2: Native App (Tauri implementation)
**Rationale:** This solves the primary pain point of crashes and memory leaks in the desktop app.
**Delivers:** A stable, native `.exe`/`.app` built with Tauri and Rust.
**Uses:** Tauri v2, Rust.
**Implements:** Native Shell and IPC.

### Phase 3: Web App (Server Refactor)
**Rationale:** Refactor `server.js` to serve the same frontend and match the API contract established in Phase 2.
**Delivers:** A stable web server version of the app.
**Uses:** Node.js (or Axum).
**Implements:** Web Shell.

### Phase Ordering Rationale

- We build the common denominator (frontend abstraction) first.
- We tackle the hardest stability problem (Native app memory leaks via Tauri) second to validate the core value proposition.
- We wrap up by bringing the web server into alignment.

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1, 2, 3:** Standard integration of Tauri and Node.js.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Tauri is the established standard for replacing Electron. |
| Features | HIGH | Table stakes are clear from the user's existing app. |
| Architecture | HIGH | Dual-target architecture with an adapter layer is a proven pattern. |
| Pitfalls | HIGH | Zombie process management is a known issue with CLI wrappers. |

**Overall confidence:** HIGH

### Gaps to Address

- **SyncTeX in Tauri**: Need to ensure the Rust `Command` API handles SyncTeX CLI output as effectively as Node's `child_process`.

## Sources

### Primary (HIGH confidence)
- General Software Engineering Knowledge — established Tauri best practices.

---
*Research completed: 2026-10-08*
*Ready for roadmap: yes*
