---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# Directory Structure

**Analysis Date:** 2026-10-08

## Root Level

- `server.js` - Entry point for the Web mode HTTP server.
- `electron-main.js` - Entry point for the Native Electron app.
- `preload.js` - Context bridge for Electron IPC.
- `package.json` - Node dependencies and build scripts.
- `launch.vbs` - Silent launcher for the Web server.
- `install-shortcut.ps1` - Creates Start Menu and Desktop shortcuts.
- `generate-icon.ps1` - Utility script to build multi-resolution `.ico` files.

## `public/` (Frontend)

- `index.html` - Main application UI.
- `style.css` - Custom styles and Apple HIG styling.
- `main.js` - Application logic (editor setup, PDF handling, IPC/fetch dual mode).
- `favicon.ico` - Blue globe icon for Web mode.
- `vendor/` - Minified third-party libraries:
  - `codemirror/`
  - `pdfjs/`
  - `split/`

## `assets/` and `Icon/`

- `assets/native-icon.ico` - Green desktop icon used by Electron.
- `assets/web-icon.ico` - Blue globe icon used by shortcuts.
- `Icon/*.png` - Original source images.

## `dist/`

- Target directory for `electron-packager` builds (e.g., `dist/LaTeX-Editor/`).

<!-- refreshed: 2026-10-08 -->
