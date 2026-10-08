---
phase: 03-native-compilation-support
plan: 01
---

# Plan 03-01 Summary: Implement compile_latex

Added `tempfile` to `Cargo.toml`. Created the `compile_latex` Tauri command in `lib.rs` that takes LaTeX code, writes it to a temporary directory, and spawns `pdflatex` using `std::process::Command`. 

The process runs synchronously with `-halt-on-error` and `-interaction=nonstopmode` to prevent hanging. Registered the command in the Tauri builder.
