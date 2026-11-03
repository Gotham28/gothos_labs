// Fix round 2 verification, part 5: item 12 (product pages), item 13 (enquiry form), plus the owl
// click-box proof and copy on the product pages.
export default async (page, { base }) => {
  const rows = [], errs = [], fails = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url()); });
  const ok = (c, m) => rows.push((c ? 'PASS' : 'FAIL') + ' | ' + m);
  await page.setViewportSize({ width: 1280, height: 900 });
  const go = async u => { await page.goto('about:blank'); await page.goto(base + '/' + u, { waitUntil: 'networkidle' }); await page.waitForTimeout(700); };

  await go('elogbook.html');
  const tabs = await page.$$eval('[data-preview-tab]', els => els.map(e => e.dataset.previewTab)); ok(tabs.length === 6, 'item 12: ELogBook preview has six screens: ' + tabs.join(','));
  await page.locator('#preview-tab-cases').click(); let title = await page.textContent('#preview-screen-title'); ok(title === 'Case Logs', 'item 12: clicking a tab changes the screen: ' + title);
  await page.locator('#preview-tab-cases').focus(); await page.keyboard.press('ArrowDown'); title = await page.textContent('#preview-screen-title'); const foc = await page.evaluate(() => document.activeElement.id); ok(title === 'Procedure Logs' && foc === 'preview-tab-procedures', `item 12: ArrowDown moves tab and focus: ${title} / ${foc}`);
  await page.keyboard.press('End'); title = await page.textContent('#preview-screen-title'); ok(title === 'Assessments', 'item 12: End -> last tab'); await page.keyboard.press('Home'); title = await page.textContent('#preview-screen-title'); ok(title === 'Dashboard', 'item 12: Home -> first tab');
  await page.locator('[data-preview-go=academics]').click(); title = await page.textContent('#preview-screen-title'); ok(title === 'Academic Activities', 'item 12: dashboard card opens a screen: ' + title);
  await page.locator('.preview-expand').click(); await page.waitForTimeout(400);
  const dlg = await page.evaluate(() => ({ open: document.getElementById('preview-dialog').open, inDialog: !!document.querySelector('#preview-dialog-host #product-window') })); ok(dlg.open && dlg.inDialog, 'item 12: expand dialog opens with the window inside ' + JSON.stringify(dlg));
  await page.locator('#preview-dialog .dialog-close').click(); await page.waitForTimeout(400);
  const back = await page.evaluate(() => ({ open: document.getElementById('preview-dialog').open, home: !!document.querySelector('#product-preview #product-window'), focus: document.activeElement.className })); ok(!back.open && back.home && back.focus === 'preview-expand', 'item 12: closing returns the window home and focus to the trigger ' + JSON.stringify(back));
  const roles = []; for (const r of ['faculty', 'department', 'resident']) { await page.locator('#role-' + r).click(); roles.push(await page.textContent('#role-panel p')); } ok(roles[0].startsWith('Professors:') && roles[1].startsWith('HOD:') && roles[2].startsWith('Residents:'), 'item 12: role tabs work');
  const txt = await page.evaluate(() => document.body.innerText);
  for (const t of ['A digital logbook for postgraduate medical training.', 'Residents log cases, procedures and academic work, professors review them, and Heads of Department track progress against training targets.', 'Paper logbooks get lost, are reviewed late, and make it hard for a department to see where residents stand against requirements.', 'Currently in pilot with the Pediatrics department', 'Case, procedure and academic logs', 'Professor review and approval', 'An HOD portal', 'Leave and attendance records', 'Postings and research tracking', 'Per-department configuration, not hardcoded to one specialty', 'Residents see their own records, professors see their assigned residents, and HODs see their department.', 'Illustrative interface']) ok(txt.includes(t), 'item 12: ELogBook copy: ' + t.slice(0, 56));
  const ctas = await page.$$eval('a.pill', a => a.map(x => x.textContent.trim() + ' -> ' + x.getAttribute('href'))); ok(ctas.every(c => c.endsWith('index.html#contact')), 'item 12: Request a demo / Talk to us all go to index.html#contact: ' + ctas.join(' ; '));
  let own = await page.evaluate(() => { const r = document.querySelector('.owl-hit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, vis: getComputedStyle(document.getElementById('owl-layer')).visibility, dock: !!document.querySelector('.chat-dock') } });
  ok(own.vis === 'visible' && !own.dock, 'item 12: small perched owl present, no floating chat button ' + JSON.stringify(own));
  await page.mouse.click(own.x, own.y); await page.waitForTimeout(1200); let c = await page.evaluate(() => document.getElementById('chat-dialog').open); ok(c, 'item 12: a real click on the product-page owl opens Hoot');
  await page.keyboard.press('Escape'); await page.waitForTimeout(1400); c = await page.evaluate(() => ({ open: document.getElementById('chat-dialog').open, vis: getComputedStyle(document.getElementById('owl-layer')).visibility })); ok(!c.open && c.vis === 'visible', 'item 12: closing chat restores the owl ' + JSON.stringify(c));
  const cover = await page.evaluate(async () => { let n = 0, onOwl = 0; for (const e of document.querySelectorAll('a, button, input, select, textarea, [role=tab]')) { if (e.closest('#owl-layer') || !e.getClientRects().length) continue; e.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(r => requestAnimationFrame(r)); const r = e.getBoundingClientRect(); for (const [a, b] of [[.1, .5], [.5, .5], [.9, .5]]) { const x = r.left + r.width * a, y = r.top + r.height * b; if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue; n++; if (document.elementFromPoint(x, y)?.closest('#owl-layer')) onOwl++; } } return { n, onOwl }; });
  ok(cover.onOwl === 0, `item 12: ELogBook page: ${cover.n} control sample points scrolled to mid-screen, ${cover.onOwl} resolve to the owl`);
  await go('elogbook.html'); await page.locator('.pp-hero a.pill--solid').click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
  const dest = await page.evaluate(() => ({ url: location.href, cur: Gothos.deck.current, top: Gothos.deck.slides[Gothos.deck.current].getBoundingClientRect().top })); ok(dest.cur === 5 && Math.abs(dest.top) < 1 && dest.url.endsWith('index.html#contact'), `item 12: Request a demo lands on the contact form: section ${dest.cur + 1}, top=${dest.top.toFixed(3)}px, ${dest.url}`);

  // ---- item 13: enquiry form
  await page.fill('input[name=name]', 'Test User'); await page.fill('#enquiry-email', 'test@example.com'); await page.fill('textarea', 'Hello from the check.');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#enquiry-form button[type=submit]')]);
  let body = ''; for await (const ch of await dl.createReadStream()) body += ch.toString('utf8'); const status = await page.textContent('#form-status');
  ok(dl.suggestedFilename() === 'gothos-labs-enquiry.txt' && body.includes('Nothing has been sent and no booking has been made.') && body.includes('Test User'), `item 13: form downloads a local brief (${dl.suggestedFilename()}), status "${status}"`);
  rows.push('  brief: ' + JSON.stringify(body));
  const note = await page.textContent('.local-note'); ok(note === 'Your brief downloads to your device. Nothing is sent, and no booking is made.', 'item 13: not-sent note intact: ' + note);

  await go('arogya.html');
  const t2 = await page.evaluate(() => document.body.innerText);
  for (const t of ["An AI assistant that speaks your patients' language.", "AROGYA is a multilingual (English and Malayalam) AI assistant for hospitals. It helps patients find doctors, book appointments and get answers from the hospital's own information, on the web and on WhatsApp.", 'Speaks Malayalam and English. Patients can ask in either language and get a natural reply.', 'Books appointments. It handles doctor search, schedules and confirmations, and sends WhatsApp reminders.', "Answers from the hospital's own information. Replies come from each hospital's own doctors, services and knowledge base, not from generic web content.", "Each hospital is kept separate. One deployment serves several hospitals, and a hospital's data never appears in another hospital's answers.", 'In live use at a hospital in Kerala.', 'General information only. It does not diagnose or replace a doctor. In an emergency, contact your local emergency services.', 'Illustrative preview, not a live conversation', 'Live demo coming soon', 'Request a demo', 'Talk to us']) ok(t2.includes(t), 'item 12: AROGYA copy: ' + t.slice(0, 56));
  const live = await page.evaluate(() => { const b = document.querySelector('[data-live-assistant]'); return { disabled: b.disabled, text: b.textContent }; }); ok(live.disabled && live.text === 'Live demo coming soon', 'item 12: live-demo button present and disabled ' + JSON.stringify(live));
  own = await page.evaluate(() => { const r = document.querySelector('.owl-hit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await page.mouse.click(own.x, own.y); await page.waitForTimeout(1200); c = await page.evaluate(() => document.getElementById('chat-dialog').open); ok(c, 'item 12: AROGYA page owl opens Hoot'); await page.keyboard.press('Escape'); await page.waitForTimeout(1300);
  await page.locator('.pp-cta a.pill', { hasText: 'Talk to us' }).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
  const d2 = await page.evaluate(() => ({ cur: Gothos.deck.current, top: Gothos.deck.slides[Gothos.deck.current].getBoundingClientRect().top })); ok(d2.cur === 5 && Math.abs(d2.top) < 1, `item 12: AROGYA "Talk to us" reaches the form: section ${d2.cur + 1}, top=${d2.top.toFixed(3)}px`);
  // phone layouts: no horizontal overflow, preview contents inside the window
  for (const [w, h] of [[390, 844], [360, 640]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const u of ['elogbook.html', 'arogya.html']) { await go(u); const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })); ok(m.sw <= m.cw, `item 12: ${u} @${w}x${h}: scrollWidth ${m.sw} <= clientWidth ${m.cw}`); }
    await go('elogbook.html');
    for (const tab of ['dashboard', 'postings', 'cases', 'procedures', 'academics', 'assessments']) { await page.evaluate(t => document.querySelector(`[data-preview-tab=${t}]`).click(), tab); const r = await page.evaluate(() => { const p = document.getElementById('elog-panel'), pr = p.getBoundingClientRect(); return [...p.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > pr.right + 1; }).length + (p.scrollWidth > p.clientWidth + 1 ? 1000 : 0); }); ok(r === 0, `item 12: preview "${tab}" fits its window at ${w}px (overflowing elements: ${r})`); }
  }
  return { errs: errs.slice(0, 5), fails, rows };
};
