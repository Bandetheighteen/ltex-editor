---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# Testing Practices

**Analysis Date:** 2026-10-08

Currently, there are no automated testing frameworks (like Jest or Mocha) set up for this project.

Testing is performed manually by:
1. Launching the Web Server (`node server.js`) and verifying browser functionality.
2. Launching Electron (`npx electron .`) and verifying IPC and UI functionality.
3. Compiling sample LaTeX documents and clicking the PDF to trigger SyncTeX.

<!-- refreshed: 2026-10-08 -->
