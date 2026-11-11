import assert from 'node:assert/strict';
import test from 'node:test';
import { sendEnquiry } from '../enquiry-api.mjs';
import { answerHoot } from '../hoot-api.mjs';

function syntheticConfig(context, name, config) {
  const previous = process.env[name];
  process.env[name] = JSON.stringify(config);
  context.after(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });
}

const enquiry = {
  name: 'Website Test',
  email: 'synthetic@example.com',
  topic: 'ELogBook',
  message: 'Synthetic message for a local check.',
  website: '',
  submissionId: 'f3c1827e-1d0f-4ec1-8c31-19b324fbac91'
};

for (const [flow, topic] of [['contact', 'ELogBook'], ['Mochi demo', 'Book a demo']]) {
  test(flow + ' enquiry uses the approved recipient and keeps the request address out of Resend', async context => {
    syntheticConfig(context, 'ENQUIRY_CONFIG_JSON', { apiKey: 'synthetic-key', from: 'test@example.com' });
    let deliveries = 0;
    const result = await sendEnquiry({ ...enquiry, topic, to: 'override@example.com' }, {
      client: '192.0.2.10',
      fetcher: async (url, options) => {
        deliveries++;
        assert.equal(url, 'https://api.resend.com/emails');
        const payload = JSON.parse(options.body);
        assert.deepEqual(payload.to, ['gothoslabs@gmail.com']);
        assert.equal(payload.reply_to, enquiry.email);
        for (const value of [enquiry.name, enquiry.email, topic, enquiry.message, enquiry.submissionId]) {
          assert.ok(payload.text.includes(value));
        }
        assert.match(payload.text, /Received: \d{4}-\d{2}-\d{2}T/);
        assert.ok(!options.body.includes('192.0.2.10'));
        assert.equal(options.headers['Idempotency-Key'], enquiry.submissionId);
        return Response.json({ id: 'synthetic-resend-id' });
      }
    });
    assert.equal(deliveries, 1);
    assert.deepEqual(result, { status: 200, body: { sent: true, reference: enquiry.submissionId } });
  });
}

test('invalid and honeypot enquiries are not forwarded', async context => {
  syntheticConfig(context, 'ENQUIRY_CONFIG_JSON', { apiKey: 'synthetic-key', from: 'test@example.com' });
  let deliveries = 0;
  const fetcher = async () => { deliveries++; return Response.json({ id: 'synthetic-resend-id' }); };
  assert.equal((await sendEnquiry({ ...enquiry, email: 'invalid' }, { fetcher })).status, 400);
  assert.equal((await sendEnquiry({ ...enquiry, website: 'spam' }, { fetcher })).status, 200);
  assert.equal(deliveries, 0);
});

test('AI replies send only validated context with store false and omit the request address', async context => {
  syntheticConfig(context, 'HOOT_CONFIG_JSON', { apiKey: 'synthetic-key', model: 'synthetic-model' });
  const messages = [
    { role: 'user', content: 'What does Gothos Labs build?', address: '192.0.2.12' },
    { role: 'assistant', content: 'We build software.' },
    { role: 'user', content: 'How do I contact the team?' }
  ];
  let requests = 0;
  const result = await answerHoot(messages, {
    client: '192.0.2.12',
    fetcher: async (url, options) => {
      requests++;
      assert.equal(url, 'https://api.openai.com/v1/responses');
      const payload = JSON.parse(options.body);
      assert.deepEqual(payload.input, messages.map(({ role, content }) => ({ role, content })));
      assert.equal(payload.store, false);
      assert.ok(!options.body.includes('192.0.2.12'));
      return Response.json({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'Use Talk to us.' }] }] });
    }
  });
  assert.equal(requests, 1);
  assert.deepEqual(result, { status: 200, body: { reply: 'Use Talk to us.' } });
});

test('recognised medical questions are refused before a provider call', async context => {
  syntheticConfig(context, 'HOOT_CONFIG_JSON', { apiKey: 'synthetic-key', model: 'synthetic-model' });
  let requests = 0;
  const result = await answerHoot([{ role: 'user', content: 'What dose should I take?' }], {
    fetcher: async () => { requests++; return Response.json({}); }
  });
  assert.equal(result.status, 200);
  assert.match(result.body.reply, /can't give medical advice/);
  assert.equal(requests, 0);
});
