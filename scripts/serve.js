/*
Pahimna - personal website and creative hub.
Copyright (C) 2026 DJKAM & DEVKLENN

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * Minimal static file server for previewing the Pahimna website locally.
 * No dependencies - uses only Node.js built-ins.
 *
 * CLI usage:
 *   npm run serve            # serves on http://localhost:8080
 *   npm run serve -- 3000    # serves on http://localhost:3000
 *
 * Programmatic usage (used by scripts/smoke-test.js):
 *   const { createServer } = require('./serve');
 *   createServer(ROOT).listen(port, ...);
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};

function createServer(rootDir) {
  const ROOT = path.resolve(rootDir);

  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = urlPath === '/' ? 'HOME.html' : urlPath.replace(/^\/+/, '');

    // Resolve the requested path and block traversal outside the project root.
    const filePath = path.resolve(ROOT, rel);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found - ' + rel);
        return;
      }
      res.writeHead(200, {
        'Content-Type':
          MIME_TYPES[path.extname(filePath).toLowerCase()] ||
          'application/octet-stream',
        'Content-Length': stat.size,
      });
      fs.createReadStream(filePath).pipe(res);
    });
  });
}

module.exports = { createServer };

if (require.main === module) {
  const DEFAULT_PORT = 8080;
  const port = parseInt(process.argv[2], 10) || DEFAULT_PORT;
  createServer(path.resolve(__dirname, '..')).listen(port, () => {
    console.log('Pahimna preview server running:');
    console.log('  Local:   http://localhost:' + port + '/');
    console.log('  Press Ctrl+C to stop.');
  });
}
