---
last_mapped_commit: 1299ffb211b27cf02d07190ef35d888d8759c711
last_mapped_at: 2026-10-08
---
# Areas of Concern & Tech Debt

**Analysis Date:** 2026-10-08

## Local Server Security

- In Web Mode, `server.js` listens on port 3000 but accepts raw code execution (`pdflatex` compilation). If exposed to a public network, this is an RCE vulnerability. (Currently mitigated by assuming it only binds locally on the user's machine).

## Temporary Files

- The application stores session files in `os.tmpdir()/latex_editor_session`. Multiple concurrent instances of the editor might overwrite each other's `main.tex` and `main.pdf` files since the directory name and file names are hardcoded. A UUID per session would solve this.

## Build Process

- Using `electron-builder` failed due to symlink creation permissions on Windows. The project currently relies on `electron-packager`, which works perfectly but requires manual renaming of the generated folder if it has a trailing/leading space, and manual packaging into installers if desired.

## Error Reporting

- `pdflatex` logs can be quite large and cryptic. The UI currently just injects the raw text into the preview pane. Parsing the log to highlight specific lines in CodeMirror (similar to SyncTeX) would be a future enhancement.

<!-- refreshed: 2026-10-08 -->
