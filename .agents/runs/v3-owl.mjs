// Fix round 2 verification, part 3: items 7 (owl frame trace) and 8 (sprite rules on the new
// paths, incl. wingbeats per airborne second and head-anchor drift), plus the Part 2 phone
// trace and reverse run. 14 transitions (forward, back, jumps) at each of the five sizes.
export default async (page, { base }) => {
  const rows = [], errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  // Transitions follow the slide count: every neighbour pair forward and back, first<->last, and two mid jumps.
  const pairsFor = n => {
    const p = [], last = n - 1;
    for (let i = 0; i < last; i++) p.push([i, i + 1]);
    for (let i = last; i > 0; i--) p.push([i, i - 1]);
    p.push([0, last], [last, 0], [Math.min(2, last), Math.max(last - 1, 0)], [Math.max(last - 1, 0), Math.min(1, last)]);
    return p;
  };
  const summary = { frames: 0, outside: 0, hidden: 0, minGap: 1e9, maxLandDx: 0, maxLandDy: 0, maxRate: 0, maxStep: 0, minBeats: 9, maxBeats: 0, maxDrift: 0, maxDur: 0, minDur: 1e9 };
  for (const [w, h] of [[1440, 900], [1366, 768], [1280, 720], [390, 844], [360, 640]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('about:blank'); await page.goto(base + '/index.html', { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
    const slideCount = await page.evaluate(() => Gothos.deck.count), pairs = pairsFor(slideCount);
    rows.push(`--- ${w}x${h} (${slideCount} slides, ${pairs.length} transitions)`);
    const res = await page.evaluate(async pairs => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const fr = Gothos.sprite.frames, boxes = Object.values(fr).map(f => f.bbox), maxW = Math.max(...boxes.map(b => b[2] - b[0])), K0 = 400 * .92 / maxW;
      const sample = () => {
        const st = Gothos.flight.state(), p = Gothos.flight.pose(), f = fr[p.key], b = f.bbox, m = p.mirror ? -1 : 1;
        let l = (b[0] - 367) * K0 * st.s, r = (b[2] - 367) * K0 * st.s; if (p.mirror) [l, r] = [-r, -l];
        const a = st.bank * Math.PI / 180, vx = (f.faceCentre[0] - 367) * K0 * m * st.s, vy = (f.faceCentre[1] - 211.8) * K0 * st.s;
        return { t: performance.now(), x: st.x, y: st.y, key: p.key, mirror: p.mirror, mode: p.mode, L: st.x + l, R: st.x + r, T: st.y + (b[1] - 211.8) * K0 * st.s, B: st.y + (b[3] - 211.8) * K0 * st.s, hb: st.headerBottom, vis: getComputedStyle(document.getElementById('owl-layer')).visibility,
          fx: st.x + vx * Math.cos(a) - vy * Math.sin(a), fy: st.y + vx * Math.sin(a) + vy * Math.cos(a), cyc: st.wingCycles, air: st.airSeconds };
      };
      const YI = { front: 0, quarter: 1, side: 2, rear: 3 }, out = [];
      for (const [a, b] of pairs) {
        Gothos.deck.go(a, { instant: true, push: false }); await sleep(800);
        const frames = []; let run = true; const loop = () => { frames.push(sample()); if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
        await sleep(100); const c0 = Gothos.flight.state(); const t0 = performance.now(); Gothos.deck.go(b, { push: false });
        while (Gothos.deck.moving) await sleep(10);
        const t1 = performance.now(); const c1 = Gothos.flight.state(); await sleep(600); run = false; await sleep(50);
        const mv = frames.filter(f => f.t >= t0 - 20 && f.t <= t1 + 20);
        const vw = innerWidth, vh = innerHeight;
        const air = mv.filter(f => f.mode === 'air'); const ev = []; let maxStep = 0, seq = [];
        for (let i = 1; i < air.length; i++) { const p = air[i - 1], q = air[i], yp = YI[p.key.split('-')[0]], yq = YI[q.key.split('-')[0]];
          if (!seq.length) seq.push(yp); if (yp !== yq) { ev.push(q.t); maxStep = Math.max(maxStep, Math.abs(yp - yq)); seq.push(yq); } if (p.mirror !== q.mirror) ev.push(q.t); }
        let maxRate = 0; for (const e of ev) maxRate = Math.max(maxRate, ev.filter(x => x >= e && x < e + 1000).length);
        const airSec = c1.airSeconds - c0.airSeconds, cycles = c1.wingCycles - c0.wingCycles;
        let drift = 0; for (let i = 1; i < mv.length; i++) drift = Math.max(drift, Math.hypot((mv[i].fx - mv[i - 1].fx) - (mv[i].x - mv[i - 1].x), (mv[i].fy - mv[i - 1].fy) - (mv[i].y - mv[i - 1].y)));
        const end = frames[frames.length - 1], st = Gothos.flight.state(), stop = st.stops[b], feet = end.y + st.geo.feet * st.s;
        out.push({ a, b, frames: mv.length, ms: t1 - t0, minGap: Math.min(...mv.map(f => f.T - f.hb)), outside: mv.filter(f => f.L < -1 || f.R > vw + 1 || f.T < -1 || f.B > vh + 1).length, hidden: mv.filter(f => f.vis !== 'visible').length, dx: end.x - stop.x, dy: feet - stop.y, ev: ev.length, maxRate, maxStep, seq: seq.join('>'), beats: airSec ? cycles / airSec : 0, airSec, drift, crouch: [...new Set(mv.map(f => f.mode))].join('+'), keys: [...new Set(mv.map(f => f.key))].length });
      }
      return out;
    }, pairs);
    for (const r of res) {
      rows.push(`${r.a}->${r.b}: frames=${r.frames} ms=${Math.round(r.ms)} minHeaderGap=${r.minGap.toFixed(1)} outside=${r.outside} hidden=${r.hidden} landDx=${r.dx.toFixed(1)} landDy=${r.dy.toFixed(1)} angleChanges=${r.ev} maxPerSec=${r.maxRate} maxStep=${r.maxStep} yawSeq=${r.seq} airSec=${r.airSec.toFixed(2)} beats/s=${r.beats.toFixed(2)} headDriftPerFrame=${r.drift.toFixed(2)}px modes=${r.crouch}`);
      summary.frames += r.frames; summary.outside += r.outside; summary.hidden += r.hidden; summary.minGap = Math.min(summary.minGap, r.minGap);
      summary.maxLandDx = Math.max(summary.maxLandDx, Math.abs(r.dx)); summary.maxLandDy = Math.max(summary.maxLandDy, Math.abs(r.dy)); summary.maxRate = Math.max(summary.maxRate, r.maxRate); summary.maxStep = Math.max(summary.maxStep, r.maxStep);
      summary.minBeats = Math.min(summary.minBeats, r.beats); summary.maxBeats = Math.max(summary.maxBeats, r.beats); summary.maxDrift = Math.max(summary.maxDrift, r.drift); summary.maxDur = Math.max(summary.maxDur, r.ms); summary.minDur = Math.min(summary.minDur, r.ms);
    }
  }
  rows.push('SUMMARY ' + JSON.stringify(Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, +(+v).toFixed(2)]))));
  return { errs, rows };
};
