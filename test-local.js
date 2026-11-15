import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const { default: horizonsHandler } = await import(pathToFileURL(path.join(root, 'api', 'horizons.js')).href);
const { default: terrainHandler } = await import(pathToFileURL(path.join(root, 'api', 'terrain.js')).href);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/horizons')) {
    const request = new Request('http://localhost' + req.url, { method: req.method, headers: req.headers });
    const response = await horizonsHandler.fetch(request);
    const body = Buffer.from(await response.arrayBuffer());
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(body);
    return;
  }

  if (url.pathname.startsWith('/api/terrain')) {
    const request = new Request('http://localhost' + req.url, { method: req.method, headers: req.headers });
    const response = await terrainHandler.fetch(request);
    const body = Buffer.from(await response.arrayBuffer());
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(body);
    return;
  }

  const filePath = url.pathname === '/' ? path.join(root, 'public', 'index.html') : path.join(root, 'public', url.pathname.replace(/^\//, ''));

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Local app test server running at http://localhost:${port}`);
  console.log('Try: http://localhost:4173/');
  console.log('API check: http://localhost:4173/api/horizons?target=sun&latitude=0&longitude=0&altitude=0&start=2026-11-14T00:00&stop=2026-11-14T06:00&step=1&unit=h');
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
