import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, extname, sep } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4177);
const types = { '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end('Forbidden'); return; }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed'); return; }
    const file = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Gothos Labs preview: http://127.0.0.1:${port}`));
