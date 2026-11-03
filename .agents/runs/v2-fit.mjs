// Fix round 2 verification, part 2: item 6 (fit at the five listed sizes, no internal scroll,
// nothing clipped, owl clear of content), finding 1 (no control resolves to the owl's click box)
// and finding 7 (screenshots are never cropped).
export default async (page, { base, shots }) => {
  const rows = [], errs = [], fails = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url()); });
  // the five listed sizes, then the wide, short windows the review named
  const sizes = [[360, 640], [390, 844], [1280, 720], [1366, 768], [1440, 900], [1920, 760], [1760, 700], [1700, 660], [2560, 700], [1920, 640]];
  let bad = 0, hitTotal = 0, ctlTotal = 0, hitOnOwl = 0;
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('about:blank'); await page.goto(base + '/index.html', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    const mode = await page.evaluate(() => Gothos.deck.active);
    if (!mode) { rows.push(`FAIL | ${w}x${h}: the deck is not active at a listed size`); bad++; continue; }
    for (let i = 0; i < 6; i++) {
      await page.evaluate(i => Gothos.deck.go(i, { instant: true, push: false }), i);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${shots}r2-fit-${w}x${h}-s${i + 1}.png` });
      const r = await page.evaluate(() => {
        const d = Gothos.deck, i = d.current, slide = d.slides[i], inner = slide.querySelector('.slide-inner');
        const vw = innerWidth, vh = innerHeight, tol = 1;
        const out = { slideTop: slide.getBoundingClientRect().top, innerOverflow: inner.scrollHeight - inner.clientHeight, innerOverflowX: inner.scrollWidth - inner.clientWidth, clipped: [], overlap: [], docScroll: document.documentElement.scrollHeight - vh, imgs: [] };
        const hb = document.querySelector('.site-header').getBoundingClientRect().bottom;
        const content = [...inner.querySelectorAll('h1,h2,p,a,button,img,figcaption,form,label,input,select,textarea,.slim-footer')].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
        const name = e => (e.tagName + '.' + (e.className || '') + ':' + (e.textContent || '').trim().slice(0, 22)).trim();
        for (const e of content) {
          const r = e.getBoundingClientRect();
          if (r.left < -tol || r.top < -tol || r.right > vw + tol || r.bottom > vh + tol) out.clipped.push(name(e));
          if (r.top < hb - 1 && r.bottom > 0) out.clipped.push('UNDER-HEADER ' + name(e));
        }
        for (const img of inner.querySelectorAll('img')) { const r = img.getBoundingClientRect(); out.imgs.push({ w: r.width, h: r.height, nw: img.naturalWidth, nh: img.naturalHeight, ratioErr: Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) / (img.naturalWidth / img.naturalHeight), inside: r.top >= hb && r.bottom <= vh && r.right <= vw && r.left >= 0 }); }
        const fr = Gothos.sprite.frames, st = Gothos.flight.state();
        const boxes = Object.values(fr).map(f => f.bbox), maxW = Math.max(...boxes.map(b => b[2] - b[0])), K0 = 400 * .92 / maxW;
        const f = fr.perch.bbox, s = st.s;
        const owl = { l: st.x + (f[0] - 367) * K0 * s, r: st.x + (f[2] - 367) * K0 * s, t: st.y + (f[1] - 211.8) * K0 * s, b: st.y + (f[3] - 211.8) * K0 * s };
        out.owlTopGap = owl.t - st.headerBottom;
        out.owlInView = owl.l >= 0 && owl.r <= vw && owl.t >= 0 && owl.b <= vh;
        for (const e of content) {
          if (e.matches('.slim-footer')) continue;
          const rr = e.getBoundingClientRect();
          if (rr.width * rr.height && owl.l < rr.right && owl.r > rr.left && owl.t < rr.bottom && owl.b > rr.top) out.overlap.push(name(e));
        }
        // finding 1: every link, button and form control (page header, dots and this section), sampled on a 5x5 grid
        const controls = [...document.querySelectorAll('.site-header a, .site-header button, .deck-dots a'), ...inner.querySelectorAll('a, button, input, select, textarea')].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
        let hits = 0, onOwl = 0; const offenders = [];
        for (const c of controls) {
          const r = c.getBoundingClientRect(); if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;
          for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) {
            const x = Math.min(vw - 1, Math.max(0, r.left + 1 + (r.width - 2) * a / 4)), y = Math.min(vh - 1, Math.max(0, r.top + 1 + (r.height - 2) * b / 4));
            const hit = document.elementFromPoint(x, y); hits++;
            if (hit && hit.closest('#owl-layer')) { onOwl++; offenders.push(name(c)); }
          }
        }
        // positive control: the owl's own hit button resolves at its centre
        const hb2 = document.querySelector('.owl-hit').getBoundingClientRect();
        const centre = document.elementFromPoint(hb2.left + hb2.width / 2, hb2.top + hb2.height / 2);
        // and the old 400px box corner no longer does
        const ob = document.getElementById('owl').getBoundingClientRect();
        const corner = document.elementFromPoint(ob.left + 6, ob.top + 6);
        return { ...out, controls: controls.length, hits, onOwl, offenders: [...new Set(offenders)], centreIsHit: !!centre?.closest('.owl-hit'), cornerOnOwl: !!corner?.closest('#owl-layer') };
      });
      const flag = r.innerOverflow > 0 || r.innerOverflowX > 0 || r.clipped.length || r.overlap.length || !r.owlInView || r.owlTopGap < 12 || Math.abs(r.slideTop) > 1 || r.docScroll > 0 || r.onOwl > 0 || !r.centreIsHit || r.cornerOnOwl || r.imgs.some(m => m.ratioErr > .01 || !m.inside);
      if (flag) bad++;
      hitTotal += r.hits; ctlTotal += r.controls; hitOnOwl += r.onOwl;
      rows.push(`${flag ? 'FAIL' : 'ok  '} ${w}x${h} s${i + 1}: top=${r.slideTop.toFixed(2)} innerOverflow=${r.innerOverflow}/${r.innerOverflowX} docScroll=${r.docScroll} clipped=${r.clipped.length} owlOverlap=${r.overlap.length} owlTopGap=${r.owlTopGap.toFixed(1)}px | controls=${r.controls} samples=${r.hits} resolvingToOwl=${r.onOwl} owlHitCentreOK=${r.centreIsHit} oldBoxCornerOnOwl=${r.cornerOnOwl}${r.imgs.length ? ' | img ' + r.imgs.map(m => `${Math.round(m.w)}x${Math.round(m.h)} of ${m.nw}x${m.nh} ratioErr=${(m.ratioErr * 100).toFixed(2)}% inside=${m.inside}`).join(' ; ') : ''}${flag ? ' ' + JSON.stringify({ c: r.clipped, o: r.overlap, off: r.offenders }) : ''}`);
    }
  }
  rows.push(`SUMMARY: ${sizes.length * 6} section/size runs, ${bad} failing; finding 1: ${ctlTotal} control checks, ${hitTotal} sample points, ${hitOnOwl} resolved to the owl layer`);
  return { errs, fails, rows };
};
