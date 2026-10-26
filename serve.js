// Zero-dependency static file server (ES Module)
// Serves ONLY files inside the /public directory with strict path traversal protection

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const NORMALIZED_PUBLIC = PUBLIC_DIR.endsWith(path.sep) ? PUBLIC_DIR : PUBLIC_DIR + path.sep;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function send404(res, requestPath) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>404 — Halaman Tidak Ditemukan</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px 20px; text-align: center; color: #12211F; background: #F4F6F5; }
    h1 { font-size: 2rem; margin-bottom: 8px; color: #1B5E59; }
    p { color: #627673; max-width: 400px; margin: 0 auto 20px; }
    a { color: #1B5E59; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Halaman atau berkas tidak ditemukan di server Teman Siap.</p>
  <a href="/">← Kembali ke Beranda</a>
</body>
</html>`);
}

function send403(res) {
  res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('403 Forbidden: Akses di luar direktori public ditolak.');
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);

    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    // Strict path traversal defense: resolve against PUBLIC_DIR
    const relativePath = reqPath.replace(/^\/+/, '');
    const resolvedPath = path.resolve(PUBLIC_DIR, relativePath);

    // Verify resolved path is strictly within PUBLIC_DIR
    if (resolvedPath !== PUBLIC_DIR && !resolvedPath.startsWith(NORMALIZED_PUBLIC)) {
      return send403(res);
    }

    fs.stat(resolvedPath, (err, stats) => {
      if (err || !stats.isFile()) {
        return send404(res, reqPath);
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'X-Content-Type-Options': 'nosniff'
      });

      if (req.method === 'HEAD') {
        return res.end();
      }

      const stream = fs.createReadStream(resolvedPath);
      stream.on('error', () => {
        if (!res.headersSent) send404(res, reqPath);
      });
      stream.pipe(res);
    });
  } catch (e) {
    send404(res, req.url);
  }
});

server.listen(PORT, () => {
  console.log(`Teman Siap server aktif di http://localhost:${PORT}`);
  console.log(`Melayani berkas dari: ${PUBLIC_DIR}`);
});
