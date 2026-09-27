const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create a persistent local session directory for TeX compilation
const SESSION_DIR = path.join(os.tmpdir(), 'latex_editor_session');
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

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

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. API: Compile LaTeX
  if (req.method === 'POST' && pathname === '/api/compile') {
    try {
      const data = await parseJsonBody(req);
      const code = data.code || '';

      if (!code.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'No LaTeX code provided' }));
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
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="document.pdf"'
          });
          return res.end(pdfBuffer);
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Compilation failed',
            log: stdout || stderr || 'pdflatex terminated with error'
          }));
        }
      });

      child.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Failed to run pdflatex. Is MiKTeX or TeX Live installed on PATH?',
          details: err.message
        }));
      });

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 2. API: SyncTeX (PDF -> LaTeX cursor mapping)
  if (req.method === 'POST' && pathname === '/api/synctex') {
    try {
      const data = await parseJsonBody(req);
      const { page, x, y } = data;

      if (page == null || x == null || y == null) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing page, x, or y coordinate' }));
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ line }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'No matching source line found', output }));
        }
      });

      child.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'SyncTeX process error', details: err.message }));
      });

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. Static File Serving
  if (req.method === 'GET' || req.method === 'HEAD') {
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
      safePath = '/index.html';
    }

    const filePath = path.join(PUBLIC_DIR, safePath);

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'no-cache'
      });

      if (req.method === 'HEAD') {
        return res.end();
      }

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
    return;
  }

  // Fallthrough
  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

// Start listening
server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`===============================================`);
  console.log(`  LaTeX Editor running at: ${url}`);
  console.log(`  Session workspace: ${SESSION_DIR}`);
  console.log(`===============================================`);

  // Auto-open browser if flag --no-open is not passed
  if (!process.argv.includes('--no-open')) {
    if (process.argv.includes('--app')) {
      // Launch in dedicated app window using msedge or chrome
      exec(`start msedge --app=${url}`, (err) => {
        if (err) exec(`start chrome --app=${url}`, () => exec(`start ${url}`));
      });
    } else {
      // Default: Open in current default browser tab
      exec(`start ${url}`);
    }
  }
});
