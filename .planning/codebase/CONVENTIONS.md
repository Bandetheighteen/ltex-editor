---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# Coding Conventions

**Analysis Date:** 2026-10-08

## JavaScript Style

- Standard ES6+ syntax.
- Both backend and frontend use CommonJS and ES modules where appropriate.
- `main.js` utilizes standard DOM APIs with async/await for network/IPC calls.

## Error Handling

- Backend `child_process.exec` calls catch errors from `pdflatex` (which routinely exits with non-zero codes on compilation errors). The backend reads the generated `.log` file and sends it back to the client for display in the preview pane.

## Dual Mode API calls

The frontend relies on the `window.api` check.

```javascript
if (window.api) {
    // We are in Electron
    response = await window.api.compile(code);
} else {
    // We are in Web browser
    let res = await fetch('/api/compile', { ... });
}
```

<!-- refreshed: 2026-10-08 -->
