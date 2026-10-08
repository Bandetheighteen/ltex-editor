<div align="center">
  <img src="assets/banner.jpg" alt="LaTeX Editor Banner" width="800"/>

  # LaTeX Editor
  
  **A sleek, local-first LaTeX editor with an Apple HIG-inspired interface.**
</div>

<br />

## 📖 What is LaTeX Editor?

LaTeX Editor is a modern, beautifully designed LaTeX editor that runs completely offline on your local machine. It focuses on providing a distraction-free, Apple HIG (Human Interface Guidelines) inspired aesthetic, while remaining incredibly fast and functional.

**Fun Fact:** The creator of this project has **zero experience in coding**. Everything you see here was completely **vibe-coded** into existence! ✨

---

## 📦 What's inside? (Two Products in One!)

We provide **two** different versions of the editor in this repository, sharing the exact same beautiful interface:

### 1. The Native Desktop App (Tauri)
A lightning-fast, standalone desktop executable. It uses **Rust** under the hood to manage memory safely and completely eliminates the crashes and zombie processes that plague other editors.
*   **Icon:** Features the custom Black & White native icon.
*   **Best for:** Everyday offline use right from your desktop.

### 2. The Web Version (Express.js)
A lightweight Node.js web server that serves the editor directly to your web browser. 
*   **Icon:** Features the custom Blue web icon.
*   **Best for:** Running the editor remotely, or if you prefer keeping your workflow strictly inside a web browser.

---

## 🚀 How to Install and Run

### Option 1: Direct Download (Easiest)
You don't need to know how to code to use this!
1. Go to the [`release/` folder in this repository](release/).
2. **For the Native App:** Download and run `LaTeX-Editor-Native-Setup.exe` to install it on your Windows machine.
3. **For the Web App:** Download `LaTeX-Editor-Web.zip`, extract it, open your terminal inside the folder and run:
   ```bash
   npm install
   npm start
   ```
   Then open `http://localhost:3000` in your browser.

*(Note: Both versions require a local TeX distribution like [MiKTeX](https://miktex.org/) installed on your computer so they can compile documents).*

### Option 2: Build from Source (For Developers)
```bash
# Clone the repository
git clone https://github.com/Bandetheighteen/ltex-editor.git
cd ltex-editor

# Install dependencies
npm install

# Run the Web Server:
npm start

# OR Run the Native App in development mode:
npx tauri dev
```

---

## 🛠️ How it Works

*   **Live PDF Preview:** Blazing fast, fully offline PDF rendering using `PDF.js`.
*   **Bidirectional SyncTeX:** Double-click anywhere on the PDF preview to instantly jump to the corresponding line of LaTeX code in the editor! 
*   **Zombie-Process Prevention:** Both the Web and Native backends feature strict 10-second compilation timeouts. If you write a bad LaTeX loop, the app will cleanly terminate the background `pdflatex` process to save your computer's CPU.
*   **Adapter Layer:** The frontend automatically detects whether it's running in a browser or the native app, routing your compile commands either through HTTP or fast native IPC.

## 🏗️ How it was Built

This project is a masterclass in AI-assisted vibe-coding. It was originally built with Electron, but was recently re-architected from the ground up for maximum stability:
*   **Frontend:** Pure, dependency-free Vanilla JavaScript, HTML, and CSS. `CodeMirror` is used for the text editor.
*   **Native Backend:** Built with **Tauri v2** and **Rust**. Rust handles the child processes (spawning `pdflatex` and `synctex`) ensuring robust memory safety and IPC communication.
*   **Web Backend:** Built with **Node.js** and **Express.js**, serving the same exact frontend folder while securely managing child processes on the server.
