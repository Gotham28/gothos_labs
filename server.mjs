import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, extname, sep } from 'node:path';
import { answerHoot } from './hoot-api.mjs';
import { sendEnquiry } from './enquiry-api.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4177);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    if (url.pathname === '/api/chat' || url.pathname === '/api/enquiry') {
      const enquiry = url.pathname === '/api/enquiry';
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (request.method !== 'POST') { response.writeHead(405).end(JSON.stringify({ error: 'Method not allowed.' })); return; }
      if (!request.headers['content-type']?.startsWith('application/json')) { response.writeHead(415).end(JSON.stringify({ error: 'JSON required.' })); return; }
      if (request.headers.origin && new URL(request.headers.origin).host !== request.headers.host) { response.writeHead(403).end(JSON.stringify({ error: 'Origin not allowed.' })); return; }
      try {
        let raw = '';
        for await (const chunk of request) {
          raw += chunk;
          if (raw.length > (enquiry ? 5_000 : 12_000)) { response.writeHead(413).end(JSON.stringify({ error: 'Request too long.' })); return; }
        }
        const body = JSON.parse(raw);
        const client = request.socket.remoteAddress || '';
        const result = enquiry ? await sendEnquiry(body, { client }) : await answerHoot(body?.messages, { client });
        response.writeHead(result.status).end(JSON.stringify(result.body));
      } catch { response.writeHead(400).end(JSON.stringify({ error: 'Invalid request.' })); }
      return;
    }
    const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    const safePath = path.toLowerCase();
    if (['hoot.config.local.json', 'enquiry.config.local.json', 'HOOT_KNOWLEDGE.md', 'hoot-api.mjs', 'enquiry-api.mjs'].some(file => resolve(root, file).toLowerCase() === safePath) || safePath.startsWith((resolve(root, 'api') + sep).toLowerCase())) {
      response.writeHead(404).end('Not found'); return;
    }
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end('Forbidden'); return; }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed'); return; }
    const file = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Gothos Labs preview: http://127.0.0.1:${port}`));
