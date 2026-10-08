# Phase 4 Verification

- **Persistent Output**: `pdflatex` compilation uses a persistent workspace directory, preventing the `.synctex.gz` file from vanishing immediately after compilation.
- **SyncTeX Execution**: The Rust command parses the `synctex edit` CLI output to safely locate the `Line:` tag and return the line number.
- **UI Wired**: The UI natively sends `(page, x, y)` coordinates via Tauri and updates the CodeMirror selection based on the `line` returned.

Phase 4 goals successfully met.
