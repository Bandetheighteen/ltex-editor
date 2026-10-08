---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# Codebase Stack

**Analysis Date:** 2026-10-08

## Primary Technologies

- **Node.js**: Backend server (`server.js`) and Electron environment.
- **Electron**: Desktop application wrapper (`electron-main.js`, `preload.js`).
- **HTML/CSS/JS**: Vanilla frontend (`public/index.html`, `public/main.js`, `public/style.css`).

## Dependencies (from package.json)

- `electron`: ^30.5.1
- `electron-builder`: ^24.13.3
- `electron-packager`: ^17.1.2

## Vendor Libraries (in `public/vendor/`)

- **CodeMirror**: Text editor (`codemirror.min.js`, `stex.min.js`, `active-line.min.js`).
- **PDF.js**: PDF rendering (`pdf.min.js`, `pdf.worker.min.js`).
- **Split.js**: Resizable pane layout (`split.min.js`).

## System Requirements

- **MiKTeX / TeX Live**: Requires `pdflatex` and `synctex` executables on the system PATH for compilation and synchronization.

<!-- refreshed: 2026-10-08 -->
