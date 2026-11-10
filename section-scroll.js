(() => {
  'use strict';
  // Section transition engine. The landing page is a deck of full-screen
  // sections (any number; each is a direct child of .deck-track); one gesture (wheel burst, swipe or key) moves exactly one, the move
  // cannot be stopped or reversed, and owl.js reads sample() each frame so the
  // owl flies in step with it. When the screen is too short, or a section's
  // content does not fit, the deck switches itself off and the page scrolls
  // normally (see evaluate()).
  const site = window.Gothos;
  const deck = document.querySelector('[data-deck]');
  if (!site || !deck) return;
  const root = document.documentElement;
  const track = deck.querySelector('.deck-track');
  const slides = [...track.children];
  const N = slides.length;
  // The URL hash for each slide; #owl cannot be a slide id, the owl button holds it.
  const ids = slides.map(slide => slide.dataset.hash || slide.id);
  // The side dots are built from the slides, so a new slide needs only a data-label:
  // each dot links to the slide's hash and reads "<label>, section N of M".
  const dotNav = document.getElementById('deck-dots');
  if (dotNav) {
    dotNav.replaceChildren(...slides.map((slide, i) => {
      const dot = document.createElement('a');
      dot.href = '#' + ids[i];
      dot.setAttribute('aria-label', `${slide.dataset.label || slide.querySelector('h1, h2')?.textContent.trim() || ids[i]}, section ${i + 1} of ${N}`);
      return dot;
    }));
  }
  const dots = [...document.querySelectorAll('#deck-dots a')];
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const WHEEL_GAP = 160;       // quiet time (ms) that ends a wheel gesture, inertia tail included
  const WHEEL_MIN = 24;        // accumulated wheel delta that starts a move
  const SWIPE = 40;            // px of swipe that starts a move
  const FLICK = { dist: 12, speed: .5 };   // px, px per ms
  const MIN_W = 360, MIN_H = 640;          // the deck turns on from this size up (if it fits)...
  const STAY_H = 600;                      // ...and stays on down to this height (hysteresis against toolbar resizes)
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const ease = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
  const normal = path => path.replace(/index\.html$/, '');
  let active = false, booted = false, current = 0, move = null, resync = false, raf = 0;
  let anchor = { index: 0, top: 0 };       // scrolling mode: the section in view and where it sat

  // The slide a URL hash names: 0 for no hash, -1 for a hash that is not a section (#main).
  function hashIndex() {
    let hash = '';
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return -1; }
    return hash ? ids.indexOf(hash) : 0;
  }
  const place = p => { track.style.transform = `translate3d(0,${-p * 100}%,0)`; };
  function mark(index) {
    slides.forEach((slide, i) => slide.classList.toggle('is-current', i === index));
    [...dots, ...links].forEach(link => {
      if (link.getAttribute('href') === '#' + ids[index]) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    deck.dataset.current = String(index);
  }
  // Where the deck is at time `now`: eased progress e (0..1) along from -> to.
  function sample(now) {
    if (!move) return { moving: false, from: current, to: current, f: 0, e: 0, pos: current, current };
    const f = clamp((now - move.start) / move.duration, 0, 1), e = ease(f);
    return { moving: true, from: move.from, to: move.to, f, e, pos: move.from + (move.to - move.from) * e, current };
  }
  function focusHeading(index) {
    const heading = slides[index].querySelector('h1, h2');
    if (heading) heading.focus({ preventScroll: true });
  }
  // After a move that ignored input (history, focus), make the screen agree with
  // the address bar, or failing that with where focus went.
  function settle() {
    if (!resync) return;
    resync = false;
    const wanted = hashIndex();
    if (wanted >= 0 && wanted !== current) { go(wanted, { push: false }); return; }
    const focused = slides.indexOf(document.activeElement?.closest('.slide'));
    if (focused >= 0 && focused !== current) go(focused, { focus: false });
  }
  function finish() {
    if (!move) return;
    const { to, focus } = move;
    current = to; move = null;
    place(current); mark(current);
    site.flight?.request();
    if (focus && !resync) focusHeading(current);   // a pending re-sync decides where focus ends up
    settle();
  }
  function loop(now) {
    raf = 0;
    if (!move) return;
    const s = sample(now);
    place(s.pos);
    if (s.f >= 1) finish();
    if (move && !raf) raf = requestAnimationFrame(loop);
  }
  // Start a move to slide `to`; false when ignored (deck off, already there, or mid-move).
  function go(to, options = {}) {
    to = clamp(Math.round(to), 0, N - 1);
    if (!active || move || to === current) return false;
    const from = current, focus = options.focus !== false;
    if (options.push !== false) history.pushState(null, '', '#' + ids[to]);
    mark(to);
    site.flight?.request();
    if (!site.motion.enabled || options.instant) {
      current = to; place(current);
      if (!options.instant) {
        const slide = slides[to];
        slide.classList.remove('fade-in'); void slide.offsetWidth; slide.classList.add('fade-in');
        slide.addEventListener('animationend', () => slide.classList.remove('fade-in'), { once: true });
      }
      if (focus) focusHeading(current);
      return true;
    }
    move = { from, to, focus, start: performance.now(), duration: Math.min(1200, 1000 + 50 * (Math.abs(to - from) - 1)) };
    if (!raf) raf = requestAnimationFrame(loop);
    return true;
  }

  const dialogOpen = () => !!document.querySelector('dialog[open]');
  const editable = el => !!el?.closest?.('input, textarea, select') || !!el?.isContentEditable;
  // Native scrolling stays for any element that really overflows.
  function nestedScroll(target) {
    for (let el = target; el && el !== document.body && el !== deck; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return true;
    }
    return false;
  }

  // Wheel and trackpad: a gesture ends only after WHEEL_GAP ms without events, so
  // momentum and rapid repeats can never start a second move.
  let lastWheel = -Infinity, gesture = false, sum = 0;
  addEventListener('wheel', event => {
    if (!active || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !event.deltaY || dialogOpen() || nestedScroll(event.target)) return;
    event.preventDefault();
    const now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    if (gap > WHEEL_GAP) { gesture = false; sum = 0; }
    if (move || gesture) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.sign(sum) !== Math.sign(delta)) sum = 0;
    sum += delta;
    if (Math.abs(sum) < WHEEL_MIN) return;
    const to = current + Math.sign(sum);
    sum = 0;
    if (to < 0 || to >= N) return;
    gesture = true;
    go(to);
  }, { passive: false });

  document.addEventListener('keydown', event => {
    if (!active || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || dialogOpen() ||
        editable(event.target) || event.target.closest?.('.nav-links.open')) return;
    let to;
    switch (event.key) {
      case ' ':
        if (event.target.closest?.('button, a, summary')) return;
        to = current + (event.shiftKey ? -1 : 1); break;
      // Shift with the other keys is the browser's (selection, shortcuts), not ours.
      case 'ArrowDown': case 'PageDown': if (event.shiftKey) return; to = current + 1; break;
      case 'ArrowUp': case 'PageUp': if (event.shiftKey) return; to = current - 1; break;
      case 'Home': if (event.shiftKey) return; to = 0; break;
      case 'End': if (event.shiftKey) return; to = N - 1; break;
      default: return;
    }
    event.preventDefault();
    if (event.repeat || move || to < 0 || to >= N) return;
    go(to);
  });

  // Touch: one swipe, one section. The browser keeps the gesture at either end,
  // so pull-to-refresh and the browser chrome stay usable.
  let touch = null;
  addEventListener('touchstart', event => {
    const point = event.touches[0];
    touch = active && event.touches.length === 1 && point && !dialogOpen() && !editable(event.target) && !nestedScroll(event.target)
      ? { x: point.clientX, y: point.clientY, time: performance.now(), done: false } : null;
  }, { passive: true });
  addEventListener('touchmove', event => {
    if (!touch) return;
    if (event.touches.length !== 1) { touch = null; return; }
    const point = event.touches[0], dy = touch.y - point.clientY, dx = touch.x - point.clientX;
    if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 10) { touch = null; return; }
    const to = current + Math.sign(dy);
    if (!move && (to < 0 || to >= N)) return;
    if (Math.abs(dy) > 6 && event.cancelable) event.preventDefault();
    if (!touch.done && !move && Math.abs(dy) >= SWIPE) { touch.done = true; go(to); }
  }, { passive: false });
  addEventListener('touchend', event => {
    if (touch && !touch.done && !move) {
      const point = event.changedTouches[0];
      const dy = touch.y - point.clientY, speed = Math.abs(dy) / Math.max(1, performance.now() - touch.time);
      if (Math.abs(dy) >= FLICK.dist && speed >= FLICK.speed) go(current + Math.sign(dy));
    }
    touch = null;
  }, { passive: true });
  addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  // Scrolling mode: the section across the middle of the screen is the current one.
  function sectionInView() {
    const middle = innerHeight / 2;
    const index = slides.findIndex(slide => { const r = slide.getBoundingClientRect(); return r.top <= middle && r.bottom > middle; });
    return index >= 0 ? index : current;
  }
  const noteAnchor = () => { anchor = { index: sectionInView(), top: slides[sectionInView()].getBoundingClientRect().top }; };
  function scrollToSlide(index) {
    slides[index].scrollIntoView({ block: 'start', behavior: site.motion.enabled ? 'smooth' : 'auto' });
  }
  // Header links, dots, footer links and in-page deep links move straight to the
  // target; one that arrives mid-move is ignored.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    // The skip link lands on the section on screen, so Tab carries on from there and never pulls the deck backwards.
    if (active && link.classList.contains('skip-link')) { event.preventDefault(); if (!move) focusHeading(current); return; }
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || normal(url.pathname) !== normal(location.pathname) || !url.hash) return;
    const index = ids.indexOf(decodeURIComponent(url.hash.slice(1)));
    if (index < 0) return;
    event.preventDefault();
    if (!active) { history.pushState(null, '', '#' + ids[index]); scrollToSlide(index); focusHeading(index); return; }
    if (move) return;
    if (index === current) { focusHeading(index); return; }
    go(index);
  });
  // Back and forward: a hash that is not a section (#main) leaves the screen where it is.
  addEventListener('popstate', () => {
    const index = hashIndex();
    if (index < 0) return;
    if (!active) { scrollToSlide(index); return; }
    if (move) { resync = true; return; }
    go(index, { push: false });
  });
  // Tabbing into another section brings it in; focus stays where the user put it.
  // Focus that arrives mid-move is ignored and settled when the move ends.
  document.addEventListener('focusin', event => {
    if (!active) return;
    const index = slides.indexOf(event.target.closest?.('.slide'));
    if (index < 0 || (move ? index === move.to : index === current)) return;
    if (move) { resync = true; return; }
    go(index, { focus: false });
  });
  // Focus can never scroll the clipped deck; reset it where a browser tries.
  const reset = () => { if (!active) return; deck.scrollTop = 0; deck.scrollLeft = 0; slides.forEach(slide => { slide.scrollTop = 0; slide.scrollLeft = 0; }); };
  deck.addEventListener('scroll', reset, { passive: true });
  slides.forEach(slide => slide.addEventListener('scroll', reset, { passive: true }));
  let scrollFrame = 0;
  addEventListener('scroll', () => {
    if (active || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (active) return;
      const index = sectionInView();
      if (index !== current) { current = index; mark(index); }
      noteAnchor();
    });
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  addEventListener('gothos-motion', () => { if (!site.motion.enabled) finish(); });
  addEventListener('gothos-chat', event => { if (event.detail?.open) finish(); });

  // The deck runs only where every section fits the screen. The listed sizes
  // (360x640 up) fit; a short, narrow or zoomed screen, or text that does not
  // fit, turns the deck off and the page scrolls normally.
  function fits() {
    return slides.every(slide => {
      const inner = slide.querySelector('.slide-inner');
      return inner.scrollHeight <= inner.clientHeight + 1 && inner.scrollWidth <= inner.clientWidth + 1;
    });
  }
  // Switch mode. A move in progress is completed first, and the address bar and
  // focus are made to agree with the section that is now shown.
  function switchTo(on, seen) {
    if (move) { current = move.to; move = null; resync = false; }
    else if (on) current = seen;
    active = on;
    root.classList.toggle('deck-mode', on);
    track.style.transform = '';
    if (on) {
      window.scrollTo(0, 0);
      place(current);
      if (hashIndex() !== current) history.replaceState(null, '', '#' + ids[current]);
      const focused = slides.indexOf(document.activeElement?.closest('.slide'));
      if (focused >= 0 && focused !== current) focusHeading(current);
    } else {
      slides[current].scrollIntoView({ block: 'start', behavior: 'auto' });
      noteAnchor();
    }
    mark(current);
    dispatchEvent(new Event('gothos-deck'));
  }
  // Decide the mode. Measuring never moves the page: with the deck on it measures in
  // place; from scrolling mode it tries the deck layout and puts the scroll position back.
  // `shrinkOnly` (content grew without a resize) can only turn the deck off, never on,
  // so the two modes cannot flip-flop.
  function evaluate(shrinkOnly = false) {
    // In scrolling mode the section to carry over is the one that was on screen before this
    // resize reflowed the page, so it comes from the last scroll, not from the new layout.
    const y = scrollY, seen = !booted || active ? current : anchor.index;
    booted = true;
    const roomy = innerWidth >= MIN_W && innerHeight >= (active ? STAY_H : MIN_H);
    let on;
    if (active) on = roomy && fits();
    else if (shrinkOnly || !roomy) on = false;
    else {
      root.classList.add('deck-mode');
      on = fits();
      root.classList.toggle('deck-mode', on);
      if (!on) window.scrollTo(0, y);
    }
    if (on !== active) { switchTo(on, seen); return; }
    // Still scrolling after a resize: keep the section that was on screen where it was.
    if (!active && !shrinkOnly) { const drift = slides[anchor.index].getBoundingClientRect().top - anchor.top; if (Math.abs(drift) > 1) window.scrollBy(0, drift); }
  }

  const start = hashIndex();
  current = Math.max(0, start);
  site.deck = {
    slides, count: N, sample, go,
    get active() { return active; },
    get current() { return current; },
    get moving() { return !!move; },
    finish, evaluate
  };
  evaluate();
  if (!active) { mark(current); if (start > 0) slides[current].scrollIntoView({ block: 'start', behavior: 'auto' }); noteAnchor(); }
  addEventListener('resize', () => evaluate(), { passive: true });
  addEventListener('orientationchange', () => evaluate(), { passive: true });
  document.fonts?.ready.then(() => evaluate());
  addEventListener('load', () => evaluate());
  // Content that grows or shrinks with no resize (text-only zoom, a late font) is re-checked;
  // that can only turn the deck off.
  if ('ResizeObserver' in window) {
    let queued = 0;
    const watch = new ResizeObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; if (active) evaluate(true); }); });
    slides.forEach(slide => slide.querySelectorAll('.slide-inner *').forEach(el => watch.observe(el)));
  }
})();
