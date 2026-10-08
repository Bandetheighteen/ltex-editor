const express = require('express');
const path = require('path');
const http = require('http');

const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Persistent workspace directory
const WORKSPACE_DIR = path.join(os.tmpdir(), 'latex-editor-web-workspace');
if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

app.post('/api/compile', async (req, res) => {
    const code = req.body.code || '';
    const texPath = path.join(WORKSPACE_DIR, 'document.tex');
    const pdfPath = path.join(WORKSPACE_DIR, 'document.pdf');
    const logPath = path.join(WORKSPACE_DIR, 'document.log');

    try {
        fs.writeFileSync(texPath, code);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write tex file' });
    }

    const pdflatex = spawn('pdflatex', [
        '-synctex=1',
        '-interaction=nonstopmode',
        '-halt-on-error',
        `-output-directory=${WORKSPACE_DIR}`,
        texPath
    ]);

    let stdout = '';
    pdflatex.stdout.on('data', data => stdout += data.toString());

    // 10-second timeout safeguard
    const timeout = setTimeout(() => {
        pdflatex.kill();
    }, 10000);

    pdflatex.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code !== 0) {
            let logContent = stdout;
            if (fs.existsSync(logPath)) {
                logContent = fs.readFileSync(logPath, 'utf8');
            }
            return res.status(400).json({ log: logContent, error: 'Compilation failed' });
        }

        if (fs.existsSync(pdfPath)) {
            const pdfBuffer = fs.readFileSync(pdfPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        } else {
            res.status(500).json({ error: 'PDF not generated' });
        }
    });
});

app.post('/api/synctex', (req, res) => {
    const { page, x, y } = req.body;
    const pdfPath = path.join(WORKSPACE_DIR, 'document.pdf');
    
    if (!fs.existsSync(pdfPath)) {
        return res.json({ line: null });
    }

    const synctex = spawn('synctex', [
        'edit',
        '-o',
        `${page}:${x}:${y}:${pdfPath}`
    ]);

    let output = '';
    synctex.stdout.on('data', data => output += data.toString());

    synctex.on('close', () => {
        const match = output.match(/Line:(\d+)/);
        if (match && match[1]) {
            res.json({ line: parseInt(match[1], 10) });
        } else {
            res.json({ line: null });
        }
    });
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

// Graceful shutdown handling
function shutdown() {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
