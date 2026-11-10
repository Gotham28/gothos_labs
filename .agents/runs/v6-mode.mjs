// Fix round 3 verification: mode switching (findings N1-N6), the minor items, and the owl
// click area while it flies. Every case loads or resizes the way a user would; none relies on a
// fixed-size fresh load alone.
export default async (page, { base }) => {
  const rows = [], errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  const ok = (c, m) => rows.push((c ? 'PASS' : 'FAIL') + ' | ' + m);
  const sizeOf = s => s.join('x');
  const open = async (url, size) => { await page.setViewportSize({ width: size[0], height: size[1] }); await page.goto('about:blank'); await page.goto(base + '/' + url, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500); };
  const info = () => page.evaluate(() => {
    const d = Gothos.deck, mid = innerHeight / 2;
    const seen = d.slides.findIndex(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    const a = document.activeElement, fs = d.slides.indexOf(a.closest('.slide'));
    return { active: d.active, cur: d.current, seen, top: d.slides[Math.max(0, seen)].getBoundingClientRect().top, y: scrollY, hash: location.hash, moving: d.moving, act: (a.tagName + '#' + a.id).slice(0, 40), focusSlide: fs, mode: document.documentElement.className };
  });

  // Slide positions come from the page (by id / slide count), never from literals, so the deck can grow.
  await open('index.html', [1440, 900]);
  const IDS = await page.evaluate(() => Gothos.deck.slides.map(s => s.dataset.hash || s.id));
  const ix = id => { const i = IDS.indexOf(id); if (i < 0) throw new Error('no slide ' + id); return i; };

  // ---- N1: deep links land on the section, in either mode
  rows.push('N1: cold loads (mode shown per case; slides: ' + IDS.map((id, i) => id + '=' + i).join(' ') + ')');
  for (const size of [[1920, 640], [1700, 660], [1920, 600], [844, 390], [1440, 900]]) {
    for (const [hash, want] of [['#contact', ix('contact')], ['#owl', ix('owl')], ['#elogbook', ix('elogbook')]]) {
      await open('index.html' + hash, size); const s = await info();
      ok(s.seen === want && (s.active ? Math.abs(s.top) < 1 : Math.abs(s.top) < 90), `N1: ${sizeOf(size)} index.html${hash}: deck ${s.active ? 'on' : 'off (scrolling)'}, section in view ${s.seen}, its top ${s.top.toFixed(1)}px, scrollY ${Math.round(s.y)}`);
    }
  }
  for (const size of [[1920, 640], [1700, 660], [1920, 600], [844, 390]]) {
    await open('elogbook.html', size);
    const b = await page.locator('.pp-hero a.pill--solid').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500); const s = await info();
    ok(s.seen === ix('contact') && (s.active ? Math.abs(s.top) < 1 : Math.abs(s.top) < 90), `N1: ${sizeOf(size)} elogbook.html > Request a demo: deck ${s.active ? 'on' : 'off'}, section in view ${s.seen}, top ${s.top.toFixed(1)}px, url ${await page.evaluate(() => location.pathname + location.hash)}`);
    await open('arogya.html', size); const b2 = await page.locator('.pp-cta a.pill', { hasText: 'Talk to us' }).boundingBox();
    await page.evaluate(() => document.querySelector('.pp-cta').scrollIntoView({ block: 'center' })); const b3 = await page.locator('.pp-cta a.pill', { hasText: 'Talk to us' }).boundingBox(); await page.mouse.click(b3.x + b3.width / 2, b3.y + b3.height / 2);
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500); const s2 = await info();
    ok(s2.seen === ix('contact'), `N1: ${sizeOf(size)} arogya.html > Talk to us: section in view ${s2.seen}, top ${s2.top.toFixed(1)}px`);
  }
  // a resize while scrolled in scrolling mode keeps the section in view
  for (const [from, to] of [[[1920, 600], [1900, 590]], [[1920, 600], [1700, 560]], [[844, 390], [800, 380]], [[1920, 600], [1500, 620]]]) {
    await open('index.html', from); const was = await info();
    ok(!was.active, `N1: ${sizeOf(from)} starts in scrolling mode`);
    await page.evaluate(() => { document.getElementById('elogbook').scrollIntoView({ block: 'start' }); window.scrollBy(0, 140); }); await page.waitForTimeout(500);
    const before = await info();
    await page.setViewportSize({ width: to[0], height: to[1] }); await page.waitForTimeout(700); const after = await info();
    ok(!after.active && after.seen === ix('elogbook') && before.seen === ix('elogbook'), `N1: scrolled into the ELogBook section at ${sizeOf(from)} (scrollY ${Math.round(before.y)}), resized to ${sizeOf(to)}: section in view ${after.seen}, scrollY ${Math.round(after.y)}, deck ${after.active ? 'on' : 'off'}`);
  }

  // ---- N2: resizing gives the same mode as a fresh load
  rows.push('N2: resize versus fresh load');
  for (const [a, b] of [[[1440, 900], [360, 640]], [[1920, 1080], [1280, 720]], [[1366, 768], [768, 1024]], [[844, 390], [390, 844]], [[360, 640], [1440, 900]], [[1280, 720], [844, 390]], [[1920, 640], [1440, 900]], [[1440, 900], [1920, 640]]]) {
    await open('index.html', a); const m0 = (await info()).active;
    await page.setViewportSize({ width: b[0], height: b[1] }); await page.waitForTimeout(900); const resized = await info();
    await open('index.html', b); const fresh = await info();
    ok(resized.active === fresh.active, `N2: ${sizeOf(a)} (deck ${m0 ? 'on' : 'off'}) resized to ${sizeOf(b)}: deck ${resized.active ? 'on' : 'off'}; a fresh load at ${sizeOf(b)}: deck ${fresh.active ? 'on' : 'off'}`);
  }

  // ---- N4: content that grows with no resize
  rows.push('N4: text growth without a resize (simulated: text-only zoom is not drivable here, so type sizes are enlarged by an injected style)');
  await open('index.html', [1440, 900]); const g0 = await info(); ok(g0.active, 'N4: 1440x900 starts on the deck');
  await page.evaluate(() => { const s = document.createElement('style'); s.id = 'grow'; s.textContent = '.slide h2{font-size:90px !important}.s-hero h1{font-size:130px !important}.slide .lede,.slide .disclaimer{font-size:30px !important}.slide label,.slide input,.slide select,.slide textarea{font-size:24px !important}'; document.head.append(s); });
  await page.waitForTimeout(900); const g1 = await info();
  const clip = await page.evaluate(() => Gothos.deck.slides.map((s, i) => { const inner = s.querySelector('.slide-inner'); return inner.scrollHeight - inner.clientHeight; }).filter(n => n > 1).length);
  ok(!g1.active && clip === 0, `N4: text enlarged, no resize: deck ${g1.active ? 'still on' : 'off'}, sections whose content exceeds their box: ${clip}, page scrollable ${await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)}px`);
  await page.evaluate(() => document.getElementById('grow').remove()); await page.waitForTimeout(700); const g2 = await info();
  ok(!g2.active, 'N4: shrinking the text again alone does not flip the deck back on (no flip-flop): deck ' + (g2.active ? 'on' : 'off'));
  await page.setViewportSize({ width: 1440, height: 899 }); await page.waitForTimeout(900); const g3 = await info();
  ok(g3.active, 'N4: a resize re-evaluates and the deck comes back: deck ' + (g3.active ? 'on' : 'off'));

  // ---- N5: URL and focus after a mode switch
  rows.push('N5: URL and focus after a mode switch');
  await open('index.html#contact', [1920, 600]); const n0 = await info(); ok(!n0.active, 'N5a: starts in scrolling mode at 1920x600');
  await page.click('input[name=name]'); await page.evaluate(() => { document.getElementById('elogbook').scrollIntoView({ block: 'start' }); }); await page.waitForTimeout(500);
  const preFocus = await info();
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900); const n1 = await info();
  ok(n1.active && n1.cur === ix('elogbook') && n1.hash === '#elogbook' && n1.focusSlide !== ix('contact') && n1.act.startsWith('H2#elb-title'), `N5a: was scrolled to the ELogBook section (url said #contact, focus in the name field: ${preFocus.act}); after switching to the deck: shows section ${n1.cur + 1}, url ${n1.hash}, focus ${n1.act}`);
  await open('index.html', [1440, 900]); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300);
  const mid0 = await info(); await page.setViewportSize({ width: 1920, height: 560 }); await page.waitForTimeout(1200); const n2 = await info();
  ok(mid0.moving && !n2.active && !n2.moving && n2.cur === 1 && n2.seen === 1 && n2.hash === '#what-we-do', `N5b: switched to scrolling in the middle of a move (moving=${mid0.moving} just before): move completed, section in view ${n2.seen}, url ${n2.hash}, moving=${n2.moving}`);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900); const n3 = await info();
  ok(n3.active && n3.cur === 1 && n3.hash === '#what-we-do', `N5b: back to the deck shows section ${n3.cur + 1}, url ${n3.hash}`);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1600); const n4 = await info();
  ok(n4.cur === ix('products') && n4.act.startsWith('H2#products-title'), `N5b: the next move still focuses the new heading: section ${n4.cur + 1}, focus ${n4.act}`);

  // ---- N6: scrolling-mode links move focus
  rows.push('N6: scrolling mode, section links move focus');
  await open('index.html', [1920, 600]); const l0 = await info(); ok(!l0.active, 'N6: scrolling mode at 1920x600');
  const nb = await page.locator('.nav-links a[href="#contact"]').boundingBox(); await page.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2); await page.waitForTimeout(1500);
  let l1 = await info(); ok(l1.act.startsWith('H2#contact-title') && l1.seen === ix('contact'), `N6: mouse click on Talk to us: focus ${l1.act}, section in view ${l1.seen}`);
  await page.keyboard.press('Tab'); const l2 = await info(); ok(l2.focusSlide === ix('contact'), `N6: Tab continues inside the contact section: focus ${l2.act} (section ${l2.focusSlide + 1})`);
  await open('index.html', [1920, 600]); await page.locator('.nav-links a[href="#products"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  const l3 = await info(); await page.keyboard.press('Tab'); const l4 = await info();
  ok(l3.act.startsWith('H2#products-title') && l4.focusSlide === ix('products'), `N6: keyboard Enter on Products: focus ${l3.act}; next Tab goes to ${l4.act} (section ${l4.focusSlide + 1})`);

  // ---- minors
  rows.push('minors');
  await open('index.html', [1440, 900]); await page.keyboard.press('Shift+ArrowDown'); await page.keyboard.press('Shift+PageDown'); await page.keyboard.press('Shift+End'); await page.waitForTimeout(1300); let m = await info();
  ok(m.cur === 0, `Shift with ArrowDown, PageDown and End does not move the deck: section ${m.cur + 1}`);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1500); await page.keyboard.press('Shift+Space'); await page.waitForTimeout(1500); m = await info();
  ok(m.cur === 0, `Shift+Space still goes back: section ${m.cur + 1}`);
  await open('index.html', [1440, 900]); await page.keyboard.press('End'); await page.waitForTimeout(1600); await page.evaluate(() => document.querySelector('.skip-link').focus()); await page.keyboard.press('Enter'); await page.waitForTimeout(600); const sk = await info();
  await page.keyboard.press('Tab'); await page.waitForTimeout(1500); const sk2 = await info();
  ok(sk.act.startsWith('H2#contact-title'), `skip link lands on the section on screen: focus ${sk.act}`);
  ok(sk2.cur === IDS.length - 1, `Tab after the skip link does not pull the deck backwards: section ${sk2.cur + 1}, focus ${sk2.act}`);
  await open('index.html', [1440, 900]); await page.evaluate(() => sessionStorage.removeItem('gothos-motion-paused')); await page.locator('#motion-control').scrollIntoViewIfNeeded().catch(() => {});
  await page.evaluate(() => { document.getElementById('motion-control').click(); }); await page.waitForTimeout(100); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60);
  const fade = await page.evaluate(() => { const an = document.getAnimations().filter(x => x.animationName === 'position-fade' || x.animationName === 'slide-fade').map(x => x.animationName + ':' + x.effect.getTiming().duration); return an; });
  ok(fade.length > 0 && fade.every(f => +f.split(':')[1] <= 200), `Pause motion: fades are at most 200ms ${JSON.stringify(fade)}`);
  await page.evaluate(() => { sessionStorage.removeItem('gothos-motion-paused'); });
  await open('elogbook.html', [1280, 900]); const foot = await page.evaluate(() => { const f = document.querySelector('.pp-foot .slim-footer'), cs = getComputedStyle(f); return { marginTop: cs.marginTop, position: cs.position }; });
  ok(foot.marginTop === '0px' && foot.position === 'static', 'scroll-mode footer rule no longer touches the product pages ' + JSON.stringify(foot));

  // ---- owl click area while it flies (finding 9: in-flight sampling)
  rows.push('owl click area in flight');
  for (const size of [[1440, 900], [390, 844]]) {
    await open('index.html', size); let flights = 0, samples = 0, onOwl = 0, flyingSeen = 0;
    for (const [a, b] of IDS.map((_, i) => [i, (i + 1) % IDS.length])) {
      await page.evaluate(a => Gothos.deck.go(a, { instant: true, push: false }), a); await page.waitForTimeout(700);
      await page.evaluate(b => Gothos.deck.go(b, { push: false }), b);
      for (let k = 0; k < 9; k++) {
        await page.waitForTimeout(100);
        const r = await page.evaluate(() => {
          const d = Gothos.deck; if (!d.moving) return null;
          const layer = document.getElementById('owl-layer'); const vw = innerWidth, vh = innerHeight; let n = 0, on = 0;
          for (const c of document.querySelectorAll('.site-header a, .site-header button, .deck-dots a, .slide a, .slide button, .slide input, .slide select, .slide textarea')) {
            if (c.closest('#owl-layer') || !c.getClientRects().length) continue; const r = c.getBoundingClientRect(); if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;
            for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const x = Math.min(vw - 1, Math.max(0, r.left + 1 + (r.width - 2) * i / 4)), y = Math.min(vh - 1, Math.max(0, r.top + 1 + (r.height - 2) * j / 4)); n++; if (document.elementFromPoint(x, y)?.closest('#owl-layer')) on++; }
          }
          const hb = document.querySelector('.owl-hit').getBoundingClientRect(); const centre = document.elementFromPoint(hb.left + hb.width / 2, hb.top + hb.height / 2);
          return { n, on, flying: layer.classList.contains('flying'), hitLive: !!centre?.closest('.owl-hit') };
        });
        if (r) { samples += r.n; onOwl += r.on + (r.hitLive ? 1 : 0); if (r.flying) flyingSeen++; }
      }
      flights++; await page.waitForTimeout(500);
    }
    ok(onOwl === 0 && flyingSeen > 0, `in flight at ${sizeOf(size)}: ${flights} flights, ${samples} sample points on controls, ${onOwl} resolved to the owl (incl. its own hit button, which is switched off while flying); flying class seen in ${flyingSeen} samples`);
    await page.waitForTimeout(400); const rest = await page.evaluate(() => { const hb = document.querySelector('.owl-hit').getBoundingClientRect(); return !!document.elementFromPoint(hb.left + hb.width / 2, hb.top + hb.height / 2)?.closest('.owl-hit'); });
    ok(rest, `after landing the owl's hit button is live again at ${sizeOf(size)}`);
  }
  return { errs: errs.slice(0, 5), rows };
};
