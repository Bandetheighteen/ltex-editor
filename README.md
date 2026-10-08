<div align="center">
  <img src="assets/banner.jpg" alt="LaTeX Editor Banner" width="800"/>
  
  # LaTeX Editor
</div>

LaTeX is mandatory for most PhD scholars and researchers. While tools like Overleaf are standard, they require a constant internet connection. Working offline with them is difficult and often frustrating. I built this app for fellow researchers who need a reliable, fully offline native LaTeX editor.

I have no background in software development. This entire project was vibe-coded into existence.

## What is in the repository

This repository contains two versions of the editor. Both share the same interface.

### The native desktop app
A standalone executable built with Tauri and Rust. It handles memory safely and avoids the crashes common in other editors. Use this for everyday offline writing on your desktop.

### The web version
A Node.js and Express server that runs the editor in your web browser. Use this if you prefer keeping your workflow inside a browser or want to run the editor remotely.

## Installation

### Direct download
1. Go to the `release/` folder in this repository.
2. For the native app: Download and run `LaTeX-Editor-Native-Setup.exe`.
3. For the web app: Download `LaTeX-Editor-Web.zip`, extract it, open your terminal in that folder, and run:
   ```bash
   npm install
   npm start
   ```
   Then open `http://localhost:3000`.

*You need a local TeX distribution like MiKTeX installed on your computer for the editor to compile documents.*

### Build from source
```bash
git clone https://github.com/Bandetheighteen/ltex-editor.git
cd ltex-editor
npm install

# Start the web server
npm start

# Or run the native app in development mode
npx tauri dev
```

## How it works

The editor uses PDF.js for offline PDF rendering. It includes bidirectional SyncTeX support—double-click anywhere on the PDF preview and the editor jumps to the corresponding line of LaTeX code.

Both versions enforce a 10-second compilation timeout. If a document gets stuck in a LaTeX loop, the app terminates the background `pdflatex` process to prevent CPU drain. A frontend adapter automatically detects whether you are using the browser or the native app, routing compile commands through HTTP or native IPC accordingly.

## How it was built

The frontend uses standard JavaScript, HTML, and CSS with CodeMirror for the text editor.

The native backend runs on Tauri v2 and Rust. Rust handles the `pdflatex` and `synctex` child processes and manages IPC communication. The web backend uses Node.js and Express to serve the frontend and manage child processes on the server.
