---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# Integrations & External Services

**Analysis Date:** 2026-10-08

## Local Executables

- `pdflatex`: Spawned via Node.js `child_process.exec` to compile `.tex` files into `.pdf`.
- `synctex`: Spawned via Node.js `child_process.exec` to map PDF coordinates back to source code lines.

## File System

- **Temporary Sessions**: Uses `os.tmpdir()/latex_editor_session` for writing `.tex` files and generating `.pdf` outputs during compilation.

## Network

- **Local Web Server**: The web mode starts a local HTTP server on port 3000 (`server.js`).
- **Electron Internal Server**: The Electron mode spins up a local HTTP server on a random port within `electron-main.js` to serve frontend assets, avoiding `file://` protocol limitations with absolute paths.

There are no external APIs, third-party databases, or cloud services integrated. The application is completely local-first and offline.

<!-- refreshed: 2026-10-08 -->
