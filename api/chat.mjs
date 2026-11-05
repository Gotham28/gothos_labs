import { answerHoot } from '../hoot-api.mjs';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (!request.headers['content-type']?.startsWith('application/json')) return response.status(415).json({ error: 'JSON required.' });
  try {
    const origin = request.headers.origin;
    if (origin && new URL(origin).host !== request.headers.host) return response.status(403).json({ error: 'Origin not allowed.' });
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (JSON.stringify(body || {}).length > 12_000) return response.status(413).json({ error: 'Message too long.' });
    const result = await answerHoot(body?.messages, { client: request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket?.remoteAddress || '' });
    return response.status(result.status).json(result.body);
  } catch { return response.status(400).json({ error: 'Invalid request.' }); }
}
