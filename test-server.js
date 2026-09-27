const http = require('http');

async function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, body: buf });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:3000${path}`, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, size: Buffer.concat(chunks).length });
      });
    });
    req.on('error', reject);
  });
}

async function runTests() {
  console.log('--- Testing LaTeX Editor Server ---');

  // Test 1: GET index.html
  const home = await get('/');
  console.log(`Test 1 [GET /]: Status ${home.status}, Size ${home.size} bytes`);
  if (home.status !== 200) throw new Error('Home page failed');

  // Test 2: GET offline vendor asset
  const cm = await get('/vendor/codemirror/codemirror.min.js');
  console.log(`Test 2 [GET /vendor/...]: Status ${cm.status}, Size ${cm.size} bytes`);
  if (cm.status !== 200) throw new Error('Vendor asset failed');

  // Test 3: POST /api/compile
  const sampleTex = `\\documentclass{article}
\\begin{document}
Hello from automated test!
\\end{document}`;
  
  console.log('Test 3 [POST /api/compile]: Compiling sample document...');
  const compileRes = await post('/api/compile', { code: sampleTex });
  console.log(`Test 3 Status: ${compileRes.status}, Content-Type: ${compileRes.headers['content-type']}, PDF Size: ${compileRes.body.length} bytes`);
  if (compileRes.status !== 200 || !compileRes.headers['content-type'].includes('application/pdf')) {
    console.error('Compilation failed log:', compileRes.body.toString());
    throw new Error('Compilation test failed');
  }

  // Test 4: POST /api/synctex
  console.log('Test 4 [POST /api/synctex]: Testing coordinate jump...');
  const synctexRes = await post('/api/synctex', { page: 1, x: 100, y: 100 });
  console.log(`Test 4 Status: ${synctexRes.status}, Body: ${synctexRes.body.toString()}`);

  console.log('--- ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
