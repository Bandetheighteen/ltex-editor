---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# System Architecture

**Analysis Date:** 2026-10-08

## Dual-Mode Architecture

The application runs the exact same frontend (`public/`) through two distinct entry points:
1. **Web Mode**: `server.js` serves the static files via HTTP. The frontend uses `fetch()` to `/api/compile` and `/api/synctex`.
2. **Native Electron Mode**: `electron-main.js` launches a frameless `BrowserWindow`. It exposes `window.api` via `preload.js` and handles compilation via IPC channels.

## Data Flow

- **Compilation**: 
  - Editor content -> `window.api.compile()` (Electron) OR `fetch('/api/compile')` (Web).
  - Backend writes content to `os.tmpdir()/latex_editor_session/main.tex`.
  - Backend executes `pdflatex`.
  - Backend returns base64 encoded PDF or error log.
  - Frontend loads base64 data into PDF.js.
- **SyncTeX**:
  - User double-clicks PDF preview -> gets `(page, x, y)`.
  - Frontend -> `window.api.synctex()` (Electron) OR `fetch('/api/synctex')` (Web).
  - Backend executes `synctex view ...`.
  - Backend parses stdout and returns `line` number.
  - Frontend focuses CodeMirror and highlights the corresponding line.

## UI Layer

- Uses `Split.js` for dual panes (editor on left, preview on right).
- Apple HIG inspired styling with `titleBarStyle: 'hidden'` and `-webkit-app-region: drag` for Electron mode.

<!-- refreshed: 2026-10-08 -->
