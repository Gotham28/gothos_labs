// Fix round 2 verification, part 1: items 2 (loads), 3 (copy), 4 (alignment, settled px),
// 5 (no skip) and the live mid-move input tests (finding 2) plus hash handling (finding 9).
export default async (page, { base }) => {
  const rows = [], errs = [], fails = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url()); });
  page.on('requestfailed', r => fails.push('FAILED ' + r.url()));
  const ok = (c, m) => rows.push((c ? 'PASS' : 'FAIL') + ' | ' + m);
  await page.setViewportSize({ width: 1440, height: 900 });
  const load = async (hash = '') => { await page.goto('about:blank'); await page.goto(base + '/index.html' + hash, { waitUntil: 'networkidle' }); await page.waitForTimeout(600); };
  const st = () => page.evaluate(() => { const d = Gothos.deck, s = d.slides[d.current]; return { cur: d.current, top: s.getBoundingClientRect().top, next: d.slides[Math.min(d.count - 1, d.current + 1)].getBoundingClientRect().top - innerHeight, moving: d.moving, hash: location.hash, hist: history.length }; });
  const px = n => (Math.round(n * 1000) / 1000).toFixed(3);
  // Slide positions are read from the page (by id / slide count), never written as literals.
  await load();
  const IDS = await page.evaluate(() => Gothos.deck.slides.map(s => s.dataset.hash || s.id));
  const ix = id => { const i = IDS.indexOf(id); if (i < 0) throw new Error('no slide ' + id); return i; }, LAST = IDS.length - 1;

  // ---- item 2: loads, console, requests (landing, then both product pages)
  for (const u of ['index.html', 'elogbook.html', 'arogya.html']) {
    errs.length = 0; fails.length = 0;
    await page.goto('about:blank'); await page.goto(base + '/' + u, { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    ok(!errs.length && !fails.length, `item 2: ${u} loads with ${errs.length} console errors/warnings and ${fails.length} failed requests ${JSON.stringify([...errs, ...fails])}`);
  }

  // ---- item 3: copy, section by section
  await load();
  const slides = await page.evaluate(() => Gothos.deck.slides.map(s => ({ id: s.dataset.hash || s.id, text: s.textContent.replace(/\s+/g, ' ').trim(), btns: [...s.querySelectorAll('a.pill,button.pill')].map(b => b.textContent.trim() + (b.getAttribute('href') ? ' -> ' + b.getAttribute('href') : '')) })));
  const want = {
    top: ['Gothos Labs', 'Software, perfected by AI.'],
    'what-we-do': ['What we do', 'We use AI to perfect the software you rely on.', "Gothos Labs makes software perfected by AI. We start from a real workflow, build with the people who use it, and use AI to refine every detail until everyday work is simpler and better. Each organisation's information stays its own. ELogBook and AROGYA are where we started: one for postgraduate medical training, one for hospitals and their patients."],
    products: ['Our products', 'Each one starts from a real workflow. More are on the way.', 'ELogBook A digital logbook for postgraduate medical training.', "AROGYA An AI assistant that speaks your patients' language."],
    elogbook: ['ELogBook', 'A digital logbook for postgraduate medical training.', 'Residents log their work, professors review it, and Heads of Department track progress against training targets.'],
    arogya: ['AROGYA', "An AI assistant that speaks your patients' language.", 'Answers in English and Malayalam, helps patients find doctors and book appointments, on the web and on WhatsApp.', 'General information only. It does not diagnose or replace a doctor. In an emergency, contact your local emergency services.'],
    owl: ['Ask Mochi', 'Mochi is our website guide. Ask about Gothos Labs, our products, or how to work with us.', 'Talk to Mochi'],
    // The note below is the tree's current wording (enquiries are sent through /api/enquiry); this script's older
    // "brief downloads" expectation predates that and was already out of date before the Mochi task.
    contact: ['Talk to us', 'Your message will be sent to Gothos Labs. No booking is made until the team confirms it.']
  };
  for (const s of slides) for (const t of want[s.id]) ok(s.text.includes(t), `item 3: ${s.id}: ${t.slice(0, 64)}`);
  const all = slides.map(s => s.text).join(' | ');
  for (const gone of ['Hoot', 'the owl', 'Intelligent software', 'sees further', 'We bring AI to your software', 'Start from a real workflow', 'Build with the people who use it', 'Kerala']) ok(!all.includes(gone), `item 3: removed or never-present text absent on the landing page: "${gone}"`);
  rows.push('  hero text exactly: "' + slides[0].text + '"');
  rows.push('  buttons: ' + slides.map(s => s.id + ': ' + JSON.stringify(s.btns)).join(' ; '));
  const bring = []; for (const u of ['elogbook.html', 'arogya.html']) { await page.goto('about:blank'); await page.goto(base + '/' + u, { waitUntil: 'networkidle' }); bring.push(await page.evaluate(() => document.querySelector('.pp-cta h2').textContent)); }
  ok(bring[0] === 'Bring ELogBook to your department' && bring[1] === 'Bring AROGYA to your hospital', 'item 3: approved "Bring" headings kept: ' + JSON.stringify(bring));

  // ---- item 4: alignment after every input type, settled position in px
  rows.push('item 4: settled positions (current slide top; the next slide sits exactly one screen below, offset reported as next-H)');
  // the last section has no next one, so only its own top is checked there
  const settle = async (name, expect, extra = '') => { await page.waitForTimeout(1700); const s = await st(); const placed = expect === LAST ?Math.abs(s.top) < 1 : (Math.abs(s.top) < 1 && Math.abs(s.next) < 1); ok(s.cur === expect && placed && !s.moving, `item 4: ${name} -> section ${s.cur + 1}, top=${px(s.top)}px, next-H=${px(s.next)}px, hash=${s.hash || '(none)'} ${extra}`); };
  // a real mouse click at an element's centre; reports whether a move was under way at that instant
  const rawClick = async selector => { const b = await page.locator(selector).first().boundingBox(); const moving = await page.evaluate(() => Gothos.deck.moving); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return moving; };
  await load(); await page.mouse.move(700, 450); await page.mouse.wheel(0, 100); await settle('one wheel notch down', 1);
  await load(); await page.mouse.move(700, 450); for (let k = 0; k < 30; k++) { await page.mouse.wheel(0, Math.max(1, Math.round(90 * Math.pow(.88, k)))); await page.waitForTimeout(16); } await settle('trackpad-style burst of 30 wheel events', 1);
  await load(); await page.mouse.move(700, 450); for (let k = 0; k < 12; k++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(60); } await settle('12 mouse notches 60ms apart', 1);
  await load(); await page.mouse.move(700, 450); for (let k = 0; k < 40; k++) { await page.mouse.wheel(0, k < 20 ? 100 : 12); await page.waitForTimeout(30); } await settle('40 events over 1.2s (momentum tail)', 1);
  await load(); await page.mouse.move(700, 450); await page.mouse.wheel(0, 100); await page.waitForTimeout(1500); await page.mouse.wheel(0, 100); await settle('two separate wheel gestures', 2);
  await page.waitForTimeout(300); await page.mouse.wheel(0, -100); await settle('then a gesture up', 1);
  for (const [k, e, n] of [['ArrowDown', 1, 'ArrowDown'], ['PageDown', 1, 'PageDown'], ['Space', 1, 'Space']]) { await load(); await page.keyboard.press(k); await settle(n, e); }
  for (const k of ['ArrowUp', 'PageUp', 'Shift+Space']) { await load('#elogbook'); await page.keyboard.press(k); await settle(k + ' from the ELogBook section', ix('elogbook') - 1); }
  await load(); await page.keyboard.press('End'); await settle('End', LAST); await page.keyboard.press('Home'); await settle('Home', 0);
  await load(); await page.click('.deck-dots a[href="#owl"]'); await settle('dot nav to Ask Mochi', ix('owl'));
  await load(); await page.click('.deck-dots a[href="#arogya"]'); await settle('dot nav to AROGYA', ix('arogya'));
  await load(); await page.click('.nav-links a[href="#products"]'); await settle('header link Products', ix('products'));
  await load(); await page.click('.nav-links a[href="#owl"]'); await settle('header link Ask Mochi (#owl)', ix('owl'));
  await load(); await page.click('.nav-links a[href="#contact"]'); await settle('header link Talk to us', LAST);
  for (const [h, e] of IDS.map((id, i) => ['#' + id, i])) { await load(h); const s = await st(); ok(s.cur === e && Math.abs(s.top) < 1 && !s.moving, `item 4: cold deep link ${h} -> section ${s.cur + 1}, top=${px(s.top)}px, not moving`); }
  await load(); await page.click('.nav-links a[href="#products"]'); await settle('history: header link to Products', ix('products'));
  await page.click('.deck-dots a[href="#owl"]'); await settle('history: dot to Ask Mochi', ix('owl'));
  await page.goBack(); await settle('history: back', ix('products')); await page.goBack(); await settle('history: back again', 0); await page.goForward(); await settle('history: forward', ix('products'));
  // swipe at 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  const swipe = (x, y0, y1, steps, ms) => page.evaluate(async ({ x, y0, y1, steps, ms }) => {
    const el = document.elementFromPoint(x, y0) || document.body;
    const mk = (type, y) => { const t = new Touch({ identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y }); return new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], targetTouches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true, cancelable: true }); };
    let prevented = 0; el.dispatchEvent(mk('touchstart', y0));
    for (let i = 1; i <= steps; i++) { const ev = mk('touchmove', y0 + (y1 - y0) * i / steps); el.dispatchEvent(ev); if (ev.defaultPrevented) prevented++; await new Promise(r => setTimeout(r, ms / steps)); }
    el.dispatchEvent(mk('touchend', y1)); return prevented;
  }, { x, y0, y1, steps, ms });
  await load(); let p = await swipe(200, 600, 500, 6, 200); await settle('swipe up 100px @390x844', 1, 'prevented=' + p);
  p = await swipe(200, 300, 420, 6, 200); await settle('swipe down 120px', 0);
  await load(); await swipe(200, 500, 470, 3, 40); await settle('30px flick in 40ms', 1);
  await load(); await swipe(200, 500, 480, 4, 400); await settle('slow 20px drag stays', 0);
  await load(); p = await swipe(200, 300, 420, 6, 200); await page.waitForTimeout(700); const s0 = await st(); ok(s0.cur === 0 && p === 0, `item 4: swipe down on the first section is left to the browser (preventDefault calls: ${p}) cur=${s0.cur}`);
  await load(); await swipe(200, 700, 400, 10, 200); await swipe(200, 700, 300, 10, 200); await swipe(200, 700, 300, 10, 200); await settle('3 swipes during one move', 1);
  await page.setViewportSize({ width: 1440, height: 900 });

  // ---- item 5: no skip, input during a move is ignored
  await load(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(100); await page.keyboard.press('ArrowDown'); await page.keyboard.press('PageDown'); await page.keyboard.press('End'); await settle('item 5: 3 keys incl. End during one move', 1);
  await load(); await page.mouse.move(700, 450); await page.mouse.wheel(0, 100); await page.waitForTimeout(300); await page.mouse.wheel(0, -100); await settle('item 5: reverse wheel mid-move is ignored', 1);

  // ---- finding 2: live mid-move tests of each input type
  rows.push('finding 2: mid-move input (a move takes ~1000ms; the input arrives at 300ms)');
  await load(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300);
  const h0 = (await st()).hist; const m0 = await rawClick('.deck-dots a[href="#owl"]'); await page.waitForTimeout(1700); let s = await st();
  ok(m0 && s.cur === 1 && s.hash === '#what-we-do' && s.hist === h0, `finding 2: raw mouse click on a dot mid-move (moving=${m0} at click time) ignored: section ${s.cur + 1}, hash ${s.hash}, history entries ${h0} -> ${s.hist}`);
  await load(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300); const h1 = (await st()).hist; const m1 = await rawClick('.nav-links a[href="#products"]'); await page.waitForTimeout(1700); s = await st();
  ok(m1 && s.cur === 1 && s.hash === '#what-we-do' && s.hist === h1, `finding 2: raw mouse click on a header link mid-move (moving=${m1} at click time) ignored: section ${s.cur + 1}, hash ${s.hash}, history entries ${h1} -> ${s.hist}`);
  await load(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1500); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300);
  await page.evaluate(() => history.back()); await page.waitForTimeout(250); const mid = await st();
  ok(mid.moving, `finding 2: back/forward mid-move does not interrupt the move (still moving, hash already ${mid.hash})`);
  await page.waitForTimeout(900); const afterMove = await st(); await page.waitForTimeout(1500); s = await st();
  ok(s.cur === 1 && s.hash === '#what-we-do' && Math.abs(s.top) < 1 && !s.moving, `finding 2: after the move the screen re-syncs to the URL hash: right after the move section ${afterMove.cur + 1}, settled section ${s.cur + 1}, top=${px(s.top)}px, hash ${s.hash}`);
  await load(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('a[href="arogya.html"]').focus()); await page.waitForTimeout(900); const f1 = await st();
  ok(f1.moving || f1.cur === 1, `finding 2: focus into another section mid-move does not interrupt the move (cur=${f1.cur + 1}, moving=${f1.moving})`);
  await page.waitForTimeout(1800); s = await st(); const focused = await page.evaluate(() => document.activeElement.getAttribute('href'));
  ok(s.cur === ix('arogya') && Math.abs(s.top) < 1 && focused === 'arogya.html' && s.hash === '#arogya', `finding 2: after the move the screen follows focus: section ${s.cur + 1}, top=${px(s.top)}px, hash ${s.hash}, focused ${focused}`);

  // ---- finding 9: #main and unknown hashes leave the screen where it is
  await load('#elogbook'); await page.keyboard.press('Tab'); await page.evaluate(() => { document.querySelector('.skip-link').focus(); }); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); s = await st();
  ok(s.cur === ix('elogbook') && Math.abs(s.top) < 1, `finding 9: skip link (#main) does not reset to the hero: section ${s.cur + 1}, hash ${s.hash}`);
  await page.evaluate(() => { location.hash = '#nonsense'; }); await page.waitForTimeout(1300); s = await st(); ok(s.cur === ix('elogbook'), `finding 9: unknown hash #nonsense ignored: section ${s.cur + 1}`);
  await page.evaluate(() => { location.hash = '#contact'; }); await page.waitForTimeout(1500); s = await st(); ok(s.cur === LAST, `finding 9: manual hash change to #contact still works: section ${s.cur + 1}`);
  return { errs: errs.slice(0, 5), rows };
};
