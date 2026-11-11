import { readFile } from 'node:fs/promises';

const configUrl = new URL('./enquiry.config.local.json', import.meta.url);
const destination = 'gothoslabs@gmail.com';
const topics = new Set(['ELogBook', 'AROGYA', 'A medical software project', 'Partnership', 'Book a demo']);
const recentRequests = new Map();
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function loadEnquiryConfig() {
  if (process.env.ENQUIRY_CONFIG_JSON) return JSON.parse(process.env.ENQUIRY_CONFIG_JSON);
  try { return JSON.parse(await readFile(configUrl, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return { apiKey: '', from: '' }; throw error; }
}

export function validateEnquiry(value) {
  if (!value || typeof value !== 'object') return null;
  for (const key of ['name', 'email', 'topic', 'message', 'submissionId']) {
    if (typeof value[key] !== 'string') return null;
  }
  const name = value.name.trim(), email = value.email.trim(), topic = value.topic.trim(), message = value.message.trim();
  if (name.length > 80 || !emailPattern.test(email) || email.length > 254 || !topics.has(topic) || !message || message.length > 3000 || !idPattern.test(value.submissionId)) return null;
  if (/[\r\n]/.test(name + email) || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(name + email + message)) return null;
  return { name, email, topic, message, submissionId: value.submissionId };
}

export async function sendEnquiry(value, { fetcher = fetch, client = '' } = {}) {
  const enquiry = validateEnquiry(value);
  if (!enquiry) return { status: 400, body: { error: 'Please check the enquiry fields and try again.' } };
  // Silent honeypot: automated submissions are acknowledged without emailing.
  if (value.website) return { status: 200, body: { sent: true } };
  const config = await loadEnquiryConfig();
  if (!config.apiKey || !config.from || !emailPattern.test(config.from.match(/<([^>]+)>/)?.[1] || config.from)) {
    return { status: 503, body: { error: 'Email delivery is not configured yet.' } };
  }
  if (client) {
    const now = Date.now(), recent = (recentRequests.get(client) || []).filter(time => now - time < 60 * 60_000);
    if (recent.length >= 5) return { status: 429, body: { error: 'Too many enquiries. Please try again later.' } };
    recent.push(now); recentRequests.set(client, recent);
    if (recentRequests.size > 500) recentRequests.delete(recentRequests.keys().next().value);
  }
  const content = `Gothos Labs enquiry\n\nName: ${enquiry.name || '(not provided)'}\nEmail: ${enquiry.email}\nTopic: ${enquiry.topic}\nReceived: ${new Date().toISOString()}\nReference: ${enquiry.submissionId}\n\n${enquiry.message}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': enquiry.submissionId },
      body: JSON.stringify({ from: config.from, to: [destination], reply_to: enquiry.email, subject: `Gothos Labs enquiry: ${enquiry.topic}`, text: content }),
      signal: controller.signal
    });
    if (!response.ok) return { status: 502, body: { error: 'The enquiry could not be sent. Please try again.' } };
    const data = await response.json();
    if (!data.id) return { status: 502, body: { error: 'Email delivery did not confirm the enquiry. Please try again.' } };
    return { status: 200, body: { sent: true, reference: enquiry.submissionId } };
  } catch { return { status: 502, body: { error: 'The enquiry could not be sent. Please try again.' } }; }
  finally { clearTimeout(timeout); }
}
