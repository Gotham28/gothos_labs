import assert from 'node:assert/strict';

export default async (_page, { base, browser, shots }) => {
  const checks = [];
  const origin = new URL(base).origin;
  for (const width of [1366, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 768 },
      reducedMotion: 'reduce'
    });
    const calls = [];
    const blocked = [];
    const errors = [];
    try {
      await context.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin) {
          blocked.push(url.origin);
          await route.abort();
          return;
        }
        if (request.method() === 'POST') {
          const body = request.postDataJSON();
          calls.push({ path: url.pathname, body });
          const response = url.pathname === '/api/enquiry'
            ? { sent: true, reference: body.submissionId }
            : { reply: 'Use Talk to us to contact the team.' };
          await route.fulfill({ json: response });
          return;
        }
        await route.continue();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(8000);
      page.on('pageerror', error => errors.push(error.message));

      for (const entry of ['/index.html#contact', '/elogbook.html', '/arogya.html']) {
        await page.goto(base + entry);
        const footer = page.locator('footer');
        const link = footer.getByRole('link', { name: 'Privacy Policy' });
        assert.equal(await link.getAttribute('href'), 'privacy.html');
        await link.focus();
        await page.keyboard.press('Enter');
        await page.waitForURL('**/privacy.html');
        assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'Website Privacy Policy');
        assert.match(await page.locator('main').innerText(), /Gothos Lab Private Limited/);
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
        assert.match(await page.getByRole('link', { name: 'gothoslabs@gmail.com' }).getAttribute('href'),
          /^mailto:gothoslabs@gmail\.com/);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      await page.screenshot({ path: shots + 'privacy-' + width + '.png', fullPage: true });
      checks.push(width + ' policy opens by keyboard from all three footers and fits viewport');

      await page.goto(base + '/index.html?verify=privacy-enquiry#contact');
      assert.equal(await page.evaluate(() => Gothos.deck.active), true);
      const form = page.locator('#enquiry-form');
      const enquiryNotice = page.locator('#enquiry-privacy');
      assert.equal(await form.getAttribute('method'), 'post');
      assert.equal(await form.getAttribute('aria-describedby'), 'enquiry-privacy');
      assert.match(await enquiryNotice.innerText(), /reply to your enquiry.*Resend/);
      assert.equal(await enquiryNotice.getByRole('link').getAttribute('href'), 'privacy.html#collection');
      assert.ok(await enquiryNotice.isVisible());
      assert.equal(await enquiryNotice.evaluate(el => el === el.closest('form').firstElementChild), true);
      await form.getByLabel('Your name').fill('Synthetic Visitor');
      await form.getByLabel('Work email').fill('visitor@example.com');
      await form.getByLabel('Your idea or question').fill('Synthetic contact request.');
      await form.getByRole('button', { name: 'Send enquiry' }).click();
      await form.getByRole('status').getByText(/accepted for delivery/).waitFor();
      assert.deepEqual(calls.map(call => call.path), ['/api/enquiry']);
      assert.equal(calls[0].body.email, 'visitor@example.com');
      checks.push(width + ' contact notice fits the deck, precedes input and enquiry goes to a mock');

      await page.goto(base + '/index.html?verify=privacy-mochi#owl');
      await page.getByRole('button', { name: 'Talk to Mochi' }).click();
      const chat = page.getByRole('dialog', { name: 'Mochi, your Gothos guide' });
      const chatForm = chat.locator('#chat-form');
      const input = chat.getByRole('textbox', { name: 'Message Mochi' });
      const mochiNotice = chat.locator('#mochi-privacy');
      assert.equal(await chatForm.getAttribute('method'), 'post');
      assert.equal(await input.getAttribute('aria-describedby'), 'mochi-privacy');
      assert.match(await mochiNotice.innerText(), /OpenAI receives your question and recent chat/);
      assert.ok(await mochiNotice.isVisible());
      assert.equal(await mochiNotice.evaluate(el => el.nextElementSibling.id === 'chat-form'), true);
      assert.deepEqual(calls.map(call => call.path), ['/api/enquiry']);

      async function typeMessage(text) {
        await input.fill(text);
        await input.press('Enter');
      }

      await typeMessage('How do I contact the team?');
      await chat.getByText('Use Talk to us to contact the team.').waitFor();
      assert.deepEqual(calls[1], {
        path: '/api/chat',
        body: { messages: [{ role: 'user', content: 'How do I contact the team?' }] }
      });
      checks.push(width + ' Mochi notice is visible before the first mocked AI request');

      async function startDemo() {
        await chat.getByRole('button', { name: 'Book a demo', exact: true }).last().click();
        await chat.getByText(/Resend delivers the enquiry after you confirm/).last().waitFor();
        await typeMessage('Synthetic Demo');
        await chat.getByText(/What.s the best email to reach you/).last().waitFor();
        await typeMessage('demo@example.com');
        await chat.getByText(/Should I send it now/).last().waitFor();
        assert.equal(calls.length, 2);
      }

      await startDemo();
      await typeMessage('no');
      await chat.getByText(/No enquiry was sent/).waitFor();
      assert.equal(calls.length, 2);
      await startDemo();
      await typeMessage('yes');
      await chat.getByText(/Your demo enquiry was accepted for delivery/).waitFor();
      assert.deepEqual(calls.map(call => call.path), ['/api/enquiry', '/api/chat', '/api/enquiry']);
      assert.equal(calls[2].body.email, 'demo@example.com');
      checks.push(width + ' demo notice precedes collection and confirmation gates delivery');

      await chat.getByRole('button', { name: 'Close Mochi' }).click();
      await chat.waitFor({ state: 'hidden' });
      const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
      assert.deepEqual(storage.local, []);
      assert.ok(storage.session.every(key => key === 'gothos-motion-paused'));
      assert.equal(await page.locator('#chat-messages').textContent(), '');
      assert.deepEqual(blocked, []);
      assert.deepEqual(errors, []);
      checks.push(width + ' chat closes and clears on-page messages with no external network or page errors');
    } finally {
      await context.close();
    }
  }
  return { checks };
};
