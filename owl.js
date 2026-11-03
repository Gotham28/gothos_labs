(() => {
  'use strict';
  const site = window.Gothos;
  const layer = document.getElementById('owl-layer');
  const owl = document.getElementById('owl');
  const hit = owl.querySelector('.owl-hit');   // the only clickable part of the owl; the 400px box ignores the pointer
  const deck = site.deck || null;            // landing page only; product pages perch the owl, no flight
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const ease = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
  const mix = (a, b, t) => a + (b - a) * t;

  // ---- Sprite rig -------------------------------------------------------
  // 16 poses in one atlas (tools/build-owl-atlas.py): yaw (front, quarter, side,
  // rear) x wing (up, level, down), plus perched front, blink, perched quarter
  // and a take-off crouch. Every frame shares one head anchor, and each cell is
  // symmetric about it, so a mirror about the anchor never moves the head.
  const YAWS = ['front', 'quarter', 'side', 'rear'];
  const WINGS = ['up', 'level', 'down'];
  const FILL = .92;                      // widest pose spans this much of a 400 box
  const ATLAS = new URL('assets/owl/owl-atlas.json', document.baseURI);
  let atlas = null, K0 = 1, geo = null;
  // If the atlas cannot load the owl simply never appears (its layer stays hidden
  // and unclickable until the first frame is drawn); the rest of the page works.
  const ready = fetch(ATLAS).then(r => { if (!r.ok) throw new Error('atlas ' + r.status); return r.json(); }).then(data => {
    atlas = data;
    const boxes = Object.values(data.frames).map(f => f.bbox);
    const maxW = Math.max(...boxes.map(b => b[2] - b[0]));
    K0 = 400 * FILL / maxW;
    const half = list => Math.max(...list.map(b => Math.max(data.anchor[0] - b[0], b[2] - data.anchor[0]))) * K0;
    const perch = ['perch', 'blink', 'perch-quarter'].map(n => data.frames[n].bbox);
    // Extents in 400-box px about the owl's centre point: the head anchor
    // horizontally and the mean pose centre vertically.
    geo = {
      halfFly: half(boxes), halfPerch: half(perch),
      up: (data.centre[1] - data.union[1]) * K0, down: (data.union[3] - data.centre[1]) * K0,
      upPerch: (data.centre[1] - Math.min(...perch.map(b => b[1]))) * K0, downPerch: (Math.max(...perch.map(b => b[3])) - data.centre[1]) * K0,
      feet: (data.frames.perch.bbox[3] - data.centre[1]) * K0
    };
    return data;
  }).catch(() => { atlas = null; geo = null; return null; });
  // One sprite: two stacked layers over the atlas. show() puts the next frame on
  // top and fades it in over the old one, so a swap never dips in opacity.
  function createSprite(host) {
    const [cw, ch] = atlas.cell;
    const url = new URL(atlas.image, ATLAS).href;
    host.style.width = cw + 'px'; host.style.height = ch + 'px';
    host.style.transform = `translate(${200 - atlas.anchor[0] * K0}px,${200 - atlas.centre[1] * K0}px) scale(${K0})`;
    const layers = [0, 1].map(() => {
      const el = document.createElement('i');
      el.className = 'owl-frame';
      el.style.cssText = `width:${cw}px;height:${ch}px;background-image:url("${url}");background-size:${atlas.atlas[0]}px ${atlas.atlas[1]}px;transform-origin:${atlas.anchor[0]}px 0`;
      host.append(el);
      return el;
    });
    let front = -1, animation = null;
    const sprite = {
      key: '', mirror: false,
      show(key, mirror, ms = 0) {
        // Pausing must finish an in-progress fade even if the pose is unchanged.
        if (!site.motion.enabled) ms = 0;
        if (!ms && animation) {
          animation.cancel(); animation = null;
          if (front >= 0) layers[(front + 1) % 2].style.opacity = '0';
        }
        if (key === sprite.key && mirror === sprite.mirror) return;
        const frame = atlas.frames[key];
        if (!frame) return;
        sprite.key = key; sprite.mirror = mirror;
        const previous = layers[front] || null;
        if (animation) { animation.cancel(); animation = null; }
        front = (front + 1) % 2;
        const next = layers[front], back = layers[(front + 1) % 2];
        next.style.backgroundPosition = `${-frame.x}px ${-frame.y}px`;
        next.style.transform = mirror ? 'scaleX(-1)' : '';
        next.style.zIndex = '2'; back.style.zIndex = '1';
        next.style.opacity = '1';
        if (!previous || !ms) { back.style.opacity = '0'; return; }
        back.style.opacity = '1';
        const run = animation = next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'linear' });
        run.onfinish = () => { if (animation === run) { back.style.opacity = '0'; animation = null; run.cancel(); } };
      }
    };
    return sprite;
  }
  // The 400-box rect that lands pose `name` centred in a square slot, at the
  // size it takes there. The chat avatar and the fly-to-chat clone share this.
  function boxFor(name, slot) {
    const b = atlas.frames[name].bbox;
    const k = slot.size * .94 / Math.max(b[2] - b[0], b[3] - b[1]);
    const s = k / K0;
    return {
      left: slot.left + slot.size / 2 - (200 - atlas.anchor[0] * K0 + (b[0] + b[2]) / 2 * K0) * s,
      top: slot.top + slot.size / 2 - (200 - atlas.centre[1] * K0 + (b[1] + b[3]) / 2 * K0) * s,
      width: 400 * s
    };
  }
  let sprite = null;
  ready.then(data => { if (!data) return; sprite = createSprite(owl.querySelector('.owl-sprite')); measure(); });

  let raf = 0, previous = 0;
  let clock = 0, nextBlink = 4, blinkUntil = 0;
  let pointer = { x: 0, y: 0 }, headerBottom = 0;
  let state = null, initialized = false, lastSlide = -1;
  let chat = false;
  let wingSpread = 0, wingPhase = 0, airspeed = 0, bank = 0, wingCycles = 0, airSeconds = 0;
  // Pose state: ground (perched), crouch (take-off or landing), air (wingbeat).
  let mode = 'ground', facing = 1;
  let yaw = 0, lookTime = 0;
  let size = 200, stops = [], paint = { x: 0, y: 0, s: 0, clampedY: 0 };
  const chatDialog = document.getElementById('chat-dialog');
  function syncChat() {
    // Chat owns a separate avatar, leaving the page flight state untouched.
    const open = chatDialog.open;
    chat = open;
    layer.style.visibility = open ? 'hidden' : '';
    hit.tabIndex = open ? -1 : 0;
  }
  // One body size per viewport. styles.css derives --owl from the same formula, so each
  // section's perch box reserves the room the perched owl takes without waiting for script.
  const bodySize = () => innerWidth < 760 ? Math.min(innerWidth * .5, innerHeight * .28) : Math.min(innerHeight * .43, innerWidth * .245);
  function measure() {
    headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
    if (deck && deck.active) {
      size = bodySize();
      // Each slide's perch box is the owl's resting place: feet at its bottom edge,
      // centred on it. Read relative to the slide so a move in progress is harmless.
      stops = deck.slides.map(slide => {
        const perch = slide.querySelector('.perch');
        if (!perch) return { x: innerWidth * .85, y: innerHeight - 24 };
        const s = slide.getBoundingClientRect(), r = perch.getBoundingClientRect();
        return { x: r.left - s.left + r.width / 2, y: r.bottom - s.top };
      });
    } else {
      // Product pages, and the landing page when it falls back to native scrolling:
      // a small perched owl at the bottom right, no flight.
      size = innerWidth < 760 ? 150 : 180;
      const half = geo ? geo.halfPerch * size / 400 : size * .25;
      stops = [{ x: innerWidth - 16 - half, y: innerHeight - 16 }];
    }
    request();
  }
  // One leg at time fraction f: wings open on take-off and fold into the landing.
  function wingsAt(f) {
    return Math.min(ease(clamp(f / .22)), 1 - ease(clamp((f - .72) / .28)));
  }
  // Stage poses against the section's flight clock, rather than delayed speed
  // thresholds. Hold a heading for the leg; climbing is not a turn away from us.
  function pose(dt, u, motion, sample, from, to) {
    if (!motion || chat) {
      mode = 'ground'; yaw = 0; lookTime = 0;
      return ['perch', false, 0];
    }
    const flying = sample?.moving && from && to;
    const f = flying ? sample.f : 1;
    const nextMode = flying ? (f < .08 || f > .92 ? 'crouch' : 'air') : 'ground';
    if (mode !== nextMode && nextMode === 'air') wingPhase = 0;
    mode = nextMode;
    if (flying && Math.abs(to.x - from.x) > 12) facing = to.x > from.x ? 1 : -1;
    if (mode === 'air') {
      const sideways = Math.abs(to.x - from.x) > 40;
      yaw = sideways ? (f < .20 || f > .84 ? 0 : f < .36 || f > .70 ? 1 : 2) : 0;
      // 1.4 to 1.6 beats a second in the air, a little quicker at speed.
      const rate = 1.4 + .2 * clamp(airspeed * 6);
      wingCycles += dt * rate; airSeconds += dt;
      wingPhase = (wingPhase + dt * Math.PI * 2 * rate) % (Math.PI * 2);
      // A brisk downstroke and longer recovery read better than equal holds.
      const phase = wingPhase / (Math.PI * 2);
      const wing = phase < .16 ? 0 : phase < .32 ? 1 : phase < .52 ? 2 : phase < .84 ? 1 : 0;
      return [`${YAWS[yaw]}-${WINGS[wing]}`, facing < 0, 35];
    }
    yaw = 0; wingPhase = 0;
    if (mode === 'crouch') return ['crouch', facing < 0, 45];
    // Perched: blink now and then, and turn to a pointer held well to one side.
    lookTime = Math.abs(pointer.x) > .5 ? lookTime + dt : 0;
    if (lookTime > .6) return ['perch-quarter', pointer.x < 0, 100];
    return [clock < blinkUntil ? 'blink' : 'perch', false, 40];
  }
  function request() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    if (!atlas || !sprite) return;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : .016;
    previous = now;
    syncChat();
    const motion = site.motion.enabled;
    if (motion) clock += dt;
    site.tick(now, dt);
    // Where the owl should be: its perch, or on the wing between two perches in
    // step with the deck's eased progress. The feet are what perch.
    const sample = deck && deck.active ? deck.sample(now) : null;
    const from = stops[sample ? sample.from : 0], to = stops[sample ? sample.to : 0];
    const rest = stops[sample ? sample.current : 0];
    let feet, tx, wings = 0;
    if (sample && sample.moving && motion && from && to) {
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const arc = Math.sin(Math.PI * sample.e) * clamp(innerHeight * .06 + dist * .12, 0, innerHeight * .16);
      tx = mix(from.x, to.x, sample.e);
      feet = mix(from.y, to.y, sample.e) - arc;
      wings = wingsAt(sample.f);
    } else if (rest) { tx = rest.x; feet = rest.y; }
    else { tx = innerWidth * .85; feet = innerHeight - 24; }
    const scale = size / 400;
    const target = { x: tx, y: feet - geo.feet * scale };
    if (!initialized) { state = { ...target }; initialized = true; }
    const beforeX = state.x, beforeY = state.y;
    const follow = motion ? 1 - Math.exp(-dt * 60) : 1;
    state.x = mix(state.x, target.x, follow); state.y = mix(state.y, target.y, follow);
    const vx = (state.x - beforeX) / dt;
    const vy = (state.y - beforeY) / dt;
    // Bank follows actual sideways travel, so a return flight banks the other way.
    const speed = Math.hypot(vx, vy) / Math.max(1, innerHeight);
    airspeed = motion && !chat ? mix(airspeed, speed, 1 - Math.exp(-dt * 10)) : 0;
    bank = motion && !chat ? mix(bank, clamp(vx / innerWidth * 40, -10, 10), 1 - Math.exp(-dt * 7)) : 0;
    // Wings follow the leg: open from take-off, folded on a perch.
    let u = motion && !chat ? clamp(wings * (.82 + .18 * clamp(airspeed * 5))) : 0;
    wingSpread = !motion ? 0 : mix(wingSpread, u, 1 - Math.exp(-dt * (u > wingSpread ? 12 : 5)));
    u = wingSpread;
    const [key, mirror, fade] = pose(dt, u, motion, sample, from, to);
    sprite.show(key, mirror, fade);
    layer.classList.add('is-ready');
    layer.classList.toggle('flying', !!(sample && sample.moving));   // no clicks on the owl while it crosses the page
    const bob = motion && !chat ? (Math.sin(clock * 1.8) * 2 * (1 - u) + Math.sin(wingPhase - .65) * 5 * u) : 0;
    // The same size everywhere; only a narrow window shrinks it to fit.
    const paintSize = Math.min(size, 400 * (innerWidth - 24) / (2 * geo.halfFly));
    const s = paintSize / 400;
    const paintSafe = mix(geo.halfPerch, geo.halfFly, u) * s + 6;
    const paintX = clamp(state.x, paintSafe, innerWidth - paintSafe);
    // The header gap uses the tallest pose now showing (perched or wings up) plus
    // the lean of a banked wingspan, so a perch just under the header stays put.
    const perched = mode === 'ground';
    const rise = ((perched ? geo.upPerch : geo.up) + geo.halfFly * Math.sin(Math.abs(bank) * Math.PI / 180)) * s;
    const wantY = state.y + bob;
    const paintY = clamp(wantY, headerBottom + 12 + rise, innerHeight - (perched ? geo.downPerch : geo.down) * s - 6);
    paint = { x: paintX, y: paintY, s, clampedY: paintY - wantY, bank };
    owl.style.transform = `translate3d(${paintX}px,${paintY}px,0) translate(-50%,-50%) rotate(${bank}deg) scale(${s})`;
    document.getElementById('shadow').style.cssText = `transform:translate3d(${paintX}px,${paintY + geo.feet * s}px,0) translate(-50%,-50%) scale(${s});opacity:${(1 - u) * .18}`;
    // Without motion the owl does not fly; it appears at the new perch.
    const slide = sample ? sample.current : 0;
    if (!motion && slide !== lastSlide && lastSlide !== -1) { owl.classList.remove('position-fade'); void owl.offsetWidth; owl.classList.add('position-fade'); }
    lastSlide = slide;
    if (motion && clock > nextBlink) { blinkUntil = clock + .14; nextBlink = clock + 3.5 + Math.random() * 2.5; }
    if (motion || Math.abs(state.x - target.x) > .2 || Math.abs(state.y - target.y) > .2 || (sample && sample.moving)) request();
  }
  addEventListener('resize', measure, { passive: true });
  addEventListener('pointermove', e => { pointer = { x: clamp(e.clientX / innerWidth * 2 - 1, -1, 1), y: clamp(e.clientY / innerHeight * 2 - 1, -1, 1) }; request(); }, { passive: true });
  addEventListener('touchstart', e => { const touch = e.touches[0]; if (touch) pointer = { x: clamp(touch.clientX / innerWidth * 2 - 1, -1, 1), y: clamp(touch.clientY / innerHeight * 2 - 1, -1, 1) }; request(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; previous = 0; } else { previous = 0; request(); } });
  addEventListener('gothos-motion', request);
  addEventListener('gothos-chat', () => { syncChat(); measure(); request(); });
  // Reconcile native close/Escape as well as the application's animated close.
  chatDialog.addEventListener('close', () => { syncChat(); measure(); request(); });
  new MutationObserver(() => { syncChat(); request(); }).observe(chatDialog, { attributes: true, attributeFilter: ['open'] });
  hit.addEventListener('pointerenter', () => { if (site.motion.enabled) { blinkUntil = clock + .14; owl.classList.add('owl-hover'); } });
  hit.addEventListener('pointerleave', () => owl.classList.remove('owl-hover'));
  addEventListener('gothos-deck', measure);
  new ResizeObserver(measure).observe(document.body);
  document.fonts.ready.then(measure);
  measure();
  // Geometry helpers for checks, not customer data. The sprite API is shared with
  // chat.js for the avatar and the fly-to-chat clone.
  site.flight = {
    measure, request,
    pose: () => ({ key: sprite?.key || 'perch', mirror: !!sprite?.mirror, mode, yaw }),
    state: () => ({ ...paint, stops, size, headerBottom, geo, wingCycles, airSeconds })
  };
  site.sprite = {
    ready,
    create: host => createSprite(host),
    boxFor,
    get frames() { return atlas?.frames; }
  };
})();
