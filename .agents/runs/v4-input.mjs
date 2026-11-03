// Fix round 2 verification, part 4: item 9 (keyboard and focus), item 10 (reduced motion, Pause
// motion, hidden tab), item 11 (chat), finding 3 (atlas blocked) and finding 4 (short and zoomed screens).
export default async (page, { base }) => {
  const rows = [], errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  const ok = (c, m) => rows.push((c ? 'PASS' : 'FAIL') + ' | ' + m);
  const load = async (hash = '', size) => { if (size) await page.setViewportSize({ width: size[0], height: size[1] }); await page.goto('about:blank'); await page.goto(base + '/index.html' + hash, { waitUntil: 'networkidle' }); await page.waitForTimeout(700); };
  const st = () => page.evaluate(() => { const d = Gothos.deck, s = d.slides[d.current], a = document.activeElement; return { cur: d.current, top: s.getBoundingClientRect().top, moving: d.moving, active: (a.tagName + '#' + a.id + '.' + (a.className || '')).slice(0, 44), activeSlide: d.slides.indexOf(a.closest('.slide')) }; });
  const owlAtPerch = () => page.evaluate(() => { const o = Gothos.flight.state(), i = Gothos.deck.current, stop = o.stops[i], feet = o.y + o.geo.feet * o.s; return { dx: +(o.x - stop.x).toFixed(1), dy: +(feet - stop.y).toFixed(1), moving: Gothos.deck.moving, cur: i }; });
  await page.setViewportSize({ width: 1440, height: 900 });

  // ---- item 9: keyboard and focus
  await load(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1500); let s = await st();
  ok(s.active.startsWith('H2#wwd-title'), 'item 9: after ArrowDown focus is on the new section heading: ' + s.active);
  await page.keyboard.press('End'); await page.waitForTimeout(1600); s = await st(); ok(s.active.startsWith('H2#contact-title'), 'item 9: after End focus is on the Talk to us heading: ' + s.active);
  await load(); const seq = [];
  for (let i = 0; i < 24; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(150); const x = await st(); if (x.activeSlide >= 0 && x.activeSlide !== x.cur) await page.waitForTimeout(1400); const y = await st(); seq.push(`${y.active.split('.')[0]}@s${y.activeSlide + 1}/cur${y.cur + 1}`); }
  const mismatch = seq.filter(q => { const m = q.match(/@s(-?\d+)\/cur(\d+)/); return +m[1] > 0 && +m[1] !== +m[2]; });
  ok(mismatch.length === 0, `item 9: Tab across sections: ${seq.length} stops, ${mismatch.length} mismatches between the focused element's section and the current one`); rows.push('  tab trail: ' + seq.join(' > '));
  await load('#contact'); await page.click('input[name=name]'); await page.keyboard.type('Ada '); for (const k of ['ArrowDown', 'PageDown', 'Home', 'End']) await page.keyboard.press(k); await page.waitForTimeout(1300);
  s = await st(); const v = await page.inputValue('input[name=name]'); ok(s.cur === 5 && v === 'Ada ', `item 9: typing, Space, arrows, Home/End in the name input do not move the deck (section ${s.cur + 1}, value "${v}")`);
  await page.click('textarea'); await page.keyboard.type('x y'); await page.keyboard.press('PageUp'); await page.waitForTimeout(1200); s = await st(); ok(s.cur === 5, `item 9: keys in the textarea do not move the deck (section ${s.cur + 1})`);
  await page.focus('select'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1200); s = await st(); ok(s.cur === 5, `item 9: ArrowDown in the topic select does not move the deck (section ${s.cur + 1})`);

  // ---- item 11: chat
  await load('#owl'); await page.click('.s-owl .pill'); await page.waitForTimeout(1200);
  let c = await page.evaluate(() => ({ open: document.getElementById('chat-dialog').open, layer: getComputedStyle(document.getElementById('owl-layer')).visibility }));
  ok(c.open && c.layer === 'hidden', 'item 11: Talk to Hoot opens the chat and the page owl hands over ' + JSON.stringify(c));
  await page.keyboard.type('hello'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('PageDown'); await page.waitForTimeout(1200); s = await st(); ok(s.cur === 4, `item 11: keys while the chat is open do not move the deck (section ${s.cur + 1})`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  c = await page.evaluate(() => ({ open: document.getElementById('chat-dialog').open, layer: getComputedStyle(document.getElementById('owl-layer')).visibility })); ok(!c.open && c.layer === 'visible', 'item 11: Escape closes the chat and restores the owl ' + JSON.stringify(c));
  const hit = await page.evaluate(() => { const r = document.querySelector('.owl-hit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(1100); c = await page.evaluate(() => document.getElementById('chat-dialog').open); ok(c, 'item 11: a real mouse click on the perched owl opens the chat');
  await page.keyboard.press('Escape'); await page.waitForTimeout(1300);

  // ---- item 10: Pause motion, reduced motion, hidden tab
  await page.goto('about:blank'); await page.goto(base + '/index.html'); await page.evaluate(() => sessionStorage.removeItem('gothos-motion-paused'));
  await load('#contact'); await page.locator('#motion-control').click({ timeout: 4000 }); await page.waitForTimeout(100);
  const m1 = await page.evaluate(() => ({ on: Gothos.motion.enabled, label: document.querySelector('#motion-control span').textContent, off: document.body.classList.contains('motion-off') }));
  ok(!m1.on && m1.label === 'Resume motion' && m1.off, 'item 10: Pause motion pauses ' + JSON.stringify(m1));
  await page.keyboard.press('Home'); await page.waitForTimeout(60); s = await st(); ok(!s.moving && s.cur === 0 && Math.abs(s.top) < 1, `item 10: paused: Home changes section instantly (moving=${s.moving}, top=${s.top.toFixed(3)}px)`);
  const fade = await page.evaluate(() => { const an = document.getAnimations().find(x => x.animationName === 'slide-fade'); return an ? an.effect.getTiming().duration : 'finished'; }); rows.push('  crossfade duration ms: ' + fade);
  await page.waitForTimeout(260); let o = await owlAtPerch(); ok(Math.abs(o.dx) <= 3 && Math.abs(o.dy) <= 3 && !o.moving, 'item 10: paused: owl at the perch, no flight ' + JSON.stringify(o));
  await page.keyboard.press('End'); await page.waitForTimeout(260); o = await owlAtPerch(); ok(o.cur === 5 && Math.abs(o.dx) <= 3 && Math.abs(o.dy) <= 3, 'item 10: paused: End (5 sections) -> owl at its perch within 260ms ' + JSON.stringify(o));
  const pk = await page.evaluate(() => Gothos.flight.pose().key); ok(['perch', 'blink'].includes(pk), 'item 10: paused: owl pose is perched (' + pk + ')');
  await page.locator('#motion-control').click({ timeout: 4000 }); await page.waitForTimeout(100); ok(await page.evaluate(() => Gothos.motion.enabled), 'item 10: Resume motion restores motion');
  await page.evaluate(() => sessionStorage.removeItem('gothos-motion-paused'));
  await page.emulateMedia({ reducedMotion: 'reduce' }); await load();
  const rm = await page.evaluate(() => ({ on: Gothos.motion.enabled, label: document.querySelector('#motion-control span').textContent, dis: document.querySelector('#motion-control').disabled }));
  ok(!rm.on && rm.dis, 'item 10: reduced motion: motion off, control disabled ' + JSON.stringify(rm));
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80); s = await st(); ok(!s.moving && s.cur === 1 && Math.abs(s.top) < 1, `item 10: reduced motion: instant section change (top=${s.top.toFixed(3)}px)`);
  await page.waitForTimeout(220); o = await owlAtPerch(); ok(Math.abs(o.dx) <= 3 && Math.abs(o.dy) <= 3, 'item 10: reduced motion: owl appears at its perch ' + JSON.stringify(o));
  const running = await page.evaluate(() => document.getAnimations().filter(x => x.playState === 'running').map(x => x.animationName || x.transitionProperty)); ok(running.length === 0, 'item 10: reduced motion: running animations ' + JSON.stringify(running));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await load(); await page.evaluate(() => Gothos.deck.go(3, { push: false })); await page.waitForTimeout(300);
  const hid = await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); const d = Gothos.deck; const r = { moving: d.moving, cur: d.current, top: d.slides[d.current].getBoundingClientRect().top }; delete document.hidden; return r; });
  ok(!hid.moving && hid.cur === 3 && Math.abs(hid.top) < 1, 'item 10: simulated hidden tab mid-move completes the move at once (synthetic visibilitychange, not a real background tab) ' + JSON.stringify(hid));

  // ---- finding 3: atlas JSON blocked
  for (const mode of ['abort', '404', 'badjson']) {
    errs.length = 0;
    await page.route('**/owl-atlas.json*', r => mode === 'abort' ? r.abort() : mode === '404' ? r.fulfill({ status: 404, body: 'no' }) : r.fulfill({ status: 200, contentType: 'application/json', body: '{not json' }));
    await load();
    const f3 = await page.evaluate(() => { const l = document.getElementById('owl-layer'), h = document.querySelector('.owl-hit'), r = h.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { layerClass: l.className, vis: getComputedStyle(l).visibility, hitResolves: !!at?.closest('#owl-layer'), deck: Gothos.deck.active }; });
    ok(f3.vis === 'hidden' && !f3.hitResolves && f3.layerClass === '', `finding 3 (${mode}): owl layer hidden and not clickable before/without a first frame ${JSON.stringify(f3)}`);
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1400); s = await st(); ok(s.cur === 1, `finding 3 (${mode}): the deck still works (section ${s.cur + 1})`);
    await page.evaluate(() => Gothos.deck.go(4, { instant: true, push: false })); await page.waitForTimeout(300); await page.click('.s-owl .pill'); await page.waitForTimeout(1000);
    c = await page.evaluate(() => ({ open: document.getElementById('chat-dialog').open, avatar: document.querySelector('.chat-owl-avatar').children.length })); ok(c.open, `finding 3 (${mode}): Talk to Hoot still opens the chat without the owl ${JSON.stringify(c)}`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const real = errs.filter(e => !/Failed to load resource|atlas|net::ERR/i.test(e)); ok(real.length === 0, `finding 3 (${mode}): no script errors or unhandled rejections beyond the failed request ${JSON.stringify(errs.slice(0, 3))}`);
    await page.unroute('**/owl-atlas.json*');
  }

  // ---- finding 4: short and zoomed screens fall back to normal scrolling
  rows.push('finding 4: 1280x720 at 200% zoom is a 640x360 CSS-pixel viewport (real browser zoom cannot be driven here; the layout inputs are identical)');
  for (const size of [[844, 390], [640, 360], [1024, 600], [1366, 657]]) {
    await load('', size);
    const m = await page.evaluate(() => ({ active: Gothos.deck.active, cls: document.documentElement.className, scrollable: document.documentElement.scrollHeight - innerHeight }));
    rows.push(`  ${size.join('x')}: deck ${m.active ? 'ON (fits)' : 'off, native scroll'} html.class="${m.cls}" scrollable=${m.scrollable}px`);
    if (size[1] <= 600) ok(!m.active && m.scrollable > 0, `finding 4: ${size.join('x')} falls back to native scrolling`);
    if (m.active) { rows.push(`  ${size.join('x')}: every section fits here, so the deck stays on (scrolling checks do not apply)`); continue; }
    const reach = await page.evaluate(async () => {
      const targets = [...document.querySelectorAll('.site-header a, .slide a, .slide button, .slide input, .slide select, .slide textarea, .slide .disclaimer, .slide .local-note, .slide h1, .slide h2, .slide p, .slim-footer')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none');
      const missed = [];
      for (const e of targets) {
        if (!e.closest('.site-header')) e.scrollIntoView({ block: 'center', behavior: 'instant' });
        await new Promise(r => requestAnimationFrame(r));
        const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + Math.min(r.height / 2, 12);
        const at = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, x)), Math.max(0, Math.min(innerHeight - 1, y)));
        const inView = r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1;
        if (!(at && (e === at || e.contains(at) || at.contains(e))) || !(inView || r.height > innerHeight)) missed.push((e.tagName + '.' + (e.className || '') + ':' + (e.textContent || '').trim().slice(0, 24)) + (inView ? '' : ' (outside)') + (at && (e === at || e.contains(at) || at.contains(e)) ? '' : ' (covered by ' + (at ? at.tagName + '.' + at.className : 'nothing') + ')'));
      }
      return { total: targets.length, missed };
    });
    ok(reach.missed.length === 0, `finding 4: ${size.join('x')}: ${reach.total - reach.missed.length}/${reach.total} controls, headings, copy and disclaimers reachable by scrolling ${JSON.stringify(reach.missed.slice(0, 6))}`);
    const dis = await page.evaluate(() => [...document.querySelectorAll('.disclaimer')].map(d => d.textContent.trim().slice(0, 40)));
    rows.push('  disclaimer present in page: ' + JSON.stringify(dis));
    await page.evaluate(() => window.scrollTo(0, 0)); await page.keyboard.press('PageDown'); await page.waitForTimeout(400);
    const sy = await page.evaluate(() => scrollY); ok(!m.active ? sy > 0 : true, `finding 4: ${size.join('x')}: PageDown scrolls natively (scrollY=${sy})`);
    if (!m.active) { await page.evaluate(() => window.scrollTo(0, 0)); if (await page.locator('#menu-button').isVisible()) await page.click('#menu-button'); await page.click('.nav-links a[href="#contact"]', { timeout: 4000 }).catch(() => {}); await page.waitForTimeout(900); const top = await page.evaluate(() => document.getElementById('contact').getBoundingClientRect().top); ok(Math.abs(top) < 80, `finding 4: ${size.join('x')}: header link Talk to us scrolls to the form (section top ${top.toFixed(0)}px)`); }
  }
  return { errs: errs.slice(0, 6), rows };
};
