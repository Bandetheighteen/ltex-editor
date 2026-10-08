---
phase: 03-native-compilation-support
plan: 02
---

# Plan 03-02 Summary: PDF returning and Memory Safeguards

Modified `compile_latex` to read the generated `document.pdf` into a `Vec<u8>` buffer and return it in the `CompileResponse` struct. The temporary directory drops automatically, cleaning up the filesystem.

Updated `public/backend-adapter.js` to call `window.__TAURI__.core.invoke` and unpack the `pdf_buffer` byte array into an `ArrayBuffer` so the frontend can create a blob URL and render the PDF natively.
