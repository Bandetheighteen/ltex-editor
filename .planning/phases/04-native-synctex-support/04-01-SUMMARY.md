---
phase: 04-native-synctex-support
plan: 01
---

# Plan 04-01 Summary: Implement synctex Tauri command

Modified the Rust backend to store the temporary compilation workspace in the OS temp directory (`latex-editor-workspace`) so that the `.synctex.gz` file persists across commands.
Added the `synctex` Tauri command in `lib.rs` which executes the standard command-line `synctex` tool in `edit` mode. It securely parses the process stdout to extract the `Line:` match and returns it back to the webview asynchronously.
