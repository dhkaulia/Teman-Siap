// Zero-dependency static server: `node serve.js` then open http://localhost:3000
const http = require('http'), fs = require('fs'), path = require('path');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const reqPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  
  // Look in root or public folder
  let file = path.join(__dirname, safePath);
  if (!fs.existsSync(file)) {
    file = path.join(__dirname, 'public', safePath);
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found: ' + reqPath);
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain' });
    res.end(data);
  });
}).listen(process.env.PORT || 3000, () => {
  console.log('Teman Siap running on http://localhost:' + (process.env.PORT || 3000));
});
