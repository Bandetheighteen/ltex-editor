# Ltex Editor

> Sources: Local project repository, 2026-10-08
> Raw: [ltex-editor-project-context](../../raw/ltex-editor/ltex-editor-project-context.md)
> Updated: 2026-10-08

## Overview

Ltex Editor is a local-first LaTeX editor offering an Apple HIG-inspired interface with side-by-side LaTeX code and live PDF previews. It aims to solve the problem of needing an active internet connection for standard research tools like Overleaf, providing a stable, offline alternative.

## Architecture and Execution Modes

The application uses a shared frontend codebase (HTML, JS, CSS) built around a `BackendAdapter`, which allows it to run across two distinct backends.

1. **Native Desktop App:** Built with Tauri and Rust, this version executes `pdflatex` compilation and SyncTeX support via native child processes. It replaces a previous Electron implementation to resolve memory leaks and crashes.
2. **Web Server Version:** A Node.js and Express backend that serves the editor to web browsers, exposing HTTP endpoints for compilation and SyncTeX operations.

Both backends implement strict 10-second timeouts on compilation processes to prevent zombie processes and CPU drain.

## Core Features and Dependencies

- Side-by-side layout (editor on the left, PDF on the right).
- Bidirectional SyncTeX support mapping PDF locations to source code.
- Relies on a local TeX distribution (like MiKTeX or TeX Live) installed on the host system to provide `pdflatex` and `synctex` executables in the system PATH.
- Excludes full IDE features (like Git integration) and cloud compilation to maintain performance and simplicity.

## Project Background

The creator of the project built the editor entirely through "vibe-coding" with no prior software development experience. It targets PhD scholars and researchers who require LaTeX for publications but need a reliable offline tool. By version 1.0, the project achieved its goal of eliminating the buggy Electron architecture in favor of a stable dual-target approach.
