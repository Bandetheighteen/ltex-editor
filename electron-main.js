const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow;
let localServer;

// Create a persistent local session directory for TeX compilation
const SESSION_DIR = path.join(os.tmpdir(), 'latex_editor_session');
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Spin up a tiny local static file server so all /vendor/* paths resolve
function startLocalServer() {
  return new Promise((resolve) => {
    localServer = http.createServer((req, res) => {
      let safePath = path.normalize(req.url.split('?')[0]).replace(/^(\.\.[\\/])+/, '');
      if (safePath === '/' || safePath === '\\') safePath = '/index.html';
      const filePath = path.join(PUBLIC_DIR, safePath);

      if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403); return res.end('Forbidden');
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404); return res.end('Not Found');
        }
        const ext = path.extname(filePath).toLowerCase();
        const ct = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': ct, 'Content-Length': stats.size });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    // Use port 0 to get a random available port (avoid conflicts)
    localServer.listen(0, '127.0.0.1', () => {
      const port = localServer.address().port;
      resolve(port);
    });
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'native-icon.ico'),
    backgroundColor: '#1e1e24',
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#262930',
      symbolColor: '#9aa2b1',
      height: 36
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load from local server so all absolute /vendor/* paths work
  mainWindow.loadURL(`http://127.0.0.1:${port}/index.html`);

  // Show window gracefully once the page is ready (no white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove default menu bar for a clean native look
  Menu.setApplicationMenu(null);
}

app.whenReady().then(async () => {
  const port = await startLocalServer();
  createWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(port);
    }
  });
});

app.on('window-all-closed', () => {
  if (localServer) localServer.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for compiling LaTeX
ipcMain.handle('compile-latex', async (event, code) => {
  return new Promise((resolve, reject) => {
    if (!code.trim()) {
      return resolve({ error: 'No LaTeX code provided' });
    }

    const texPath = path.join(SESSION_DIR, 'main.tex');
    const pdfPath = path.join(SESSION_DIR, 'main.pdf');

    // Write LaTeX source
    fs.writeFileSync(texPath, code, 'utf-8');

    // Spawn pdflatex
    const args = ['-synctex=1', '-interaction=nonstopmode', '-halt-on-error', 'main.tex'];
    const child = spawn('pdflatex', args, {
      cwd: SESSION_DIR,
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });

    child.on('close', (code) => {
      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        resolve({ pdfBuffer });
      } else {
        resolve({
          error: 'Compilation failed',
          log: stdout || stderr || 'pdflatex terminated with error'
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        error: 'Failed to run pdflatex. Is MiKTeX or TeX Live installed on PATH?',
        details: err.message
      });
    });
  });
});

// IPC handler for SyncTeX
ipcMain.handle('synctex', async (event, { page, x, y }) => {
  return new Promise((resolve, reject) => {
    if (page == null || x == null || y == null) {
      return resolve({ error: 'Missing page, x, or y coordinate' });
    }

    const args = ['edit', '-o', `${page}:${x}:${y}:main.pdf`];
    const child = spawn('synctex', args, {
      cwd: SESSION_DIR,
      windowsHide: true
    });

    let output = '';
    child.stdout.on('data', chunk => { output += chunk.toString(); });
    child.stderr.on('data', chunk => { output += chunk.toString(); });

    child.on('close', () => {
      const match = output.match(/Line:(\d+)/i);
      if (match) {
        const line = parseInt(match[1], 10);
        resolve({ line });
      } else {
        resolve({ error: 'No matching source line found', output });
      }
    });

    child.on('error', (err) => {
      resolve({ error: 'SyncTeX process error', details: err.message });
    });
  });
});
