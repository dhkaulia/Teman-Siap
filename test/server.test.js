import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const NORMALIZED_PUBLIC = PUBLIC_DIR.endsWith(path.sep) ? PUBLIC_DIR : PUBLIC_DIR + path.sep;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function createTestServer() {
  return http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    let reqPath = decodeURIComponent(parsedUrl.pathname);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const relativePath = reqPath.replace(/^\/+/, '');
    const resolvedPath = path.resolve(PUBLIC_DIR, relativePath);

    if (resolvedPath !== PUBLIC_DIR && !resolvedPath.startsWith(NORMALIZED_PUBLIC)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(resolvedPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        return res.end('Not Found');
      }
      const ext = path.extname(resolvedPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
      });
      fs.createReadStream(resolvedPath).pipe(res);
    });
  });
}

describe('Static File Server & Module Loading', () => {
  let server;
  let port;

  it('starts server and serves static files with correct MIME types', async () => {
    server = createTestServer();
    await new Promise(resolve => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });

    const check = async (fileUrl, expectedMime) => {
      const res = await fetch(`http://localhost:${port}${fileUrl}`);
      assert.equal(res.status, 200, `Expected 200 for ${fileUrl}`);
      assert.ok(res.headers.get('content-type').includes(expectedMime), `Expected mime ${expectedMime} for ${fileUrl}`);
      return res.text();
    };

    const indexHtml = await check('/', 'text/html');
    assert.ok(indexHtml.includes('type="module" src="js/main.js"'));
    assert.ok(indexHtml.includes('css/tokens.css'));

    await check('/css/tokens.css', 'text/css');
    await check('/css/base.css', 'text/css');
    await check('/css/components.css', 'text/css');
    await check('/css/screens.css', 'text/css');

    await check('/js/main.js', 'text/javascript');
    await check('/js/store.js', 'text/javascript');
    await check('/js/session.js', 'text/javascript');
    await check('/js/screens/home.js', 'text/javascript');
    await check('/js/screens/emosi.js', 'text/javascript');
    await check('/js/screens/uang.js', 'text/javascript');
    await check('/js/screens/kita.js', 'text/javascript');
    await check('/js/screens/saya.js', 'text/javascript');
    await check('/js/screens/onboarding.js', 'text/javascript');
    await check('/js/flows/checkinFlow.js', 'text/javascript');
    await check('/js/flows/breathingFlow.js', 'text/javascript');
    await check('/js/flows/groundingFlow.js', 'text/javascript');
    await check('/js/flows/expenseFlow.js', 'text/javascript');
    await check('/js/flows/urgeFlow.js', 'text/javascript');
    await check('/js/flows/goalFlow.js', 'text/javascript');
    await check('/js/flows/planFlow.js', 'text/javascript');
    await check('/js/flows/coupleFlow.js', 'text/javascript');
    await check('/js/ui/choiceTiles.js', 'text/javascript');
    await check('/js/ui/bodyMap.js', 'text/javascript');
    await check('/js/ui/breather.js', 'text/javascript');
    await check('/js/ui/wave.js', 'text/javascript');
    await check('/js/ui/keypad.js', 'text/javascript');
    await check('/js/ui/bottomSheet.js', 'text/javascript');
    await check('/js/ui/bubble.js', 'text/javascript');
    await check('/dev/components.html', 'text/html');
    await check('/dev/styleguide.html', 'text/html');
    await check('/content.js', 'text/javascript');
    await check('/support.js', 'text/javascript');
    await check('/sw.js', 'text/javascript');
    await check('/manifest.webmanifest', 'application/manifest+json');
    await check('/icons/icon.svg', 'image/svg+xml');
    await check('/icons/icon-192.png', 'image/png');
    await check('/icons/icon-512.png', 'image/png');

    // Path traversal defense check
    const traversalRes = await fetch(`http://localhost:${port}/../package.json`);
    assert.ok(traversalRes.status === 403 || traversalRes.status === 404, 'Path traversal must be blocked');

    server.close();
  });
});
