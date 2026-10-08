---
phase: 04-native-synctex-support
plan: 02
---

# Plan 04-02 Summary: Wire SyncTeX UI events

Updated `backend-adapter.js` to dispatch SyncTeX coordinate lookups via `window.__TAURI__.core.invoke`. The frontend PDF viewer double-click event is now fully wired up to ask the Rust backend to resolve the code line.
