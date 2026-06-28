/* smooth-scroll.js
   Lenis smooth scroll wired into the GSAP ticker.
   Matches the init pattern from the reference demo exactly.
   Loaded as an ES module so the bare `import` statement is valid in-browser. */

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.mjs';

/* ── Lenis instance ─────────────────────────────────────────────────────────
   duration        : length of the ease-out glide in seconds
   easing          : exponential ease-out — instant start, smooth deceleration
   orientation     : explicit vertical-only scroll
   smoothWheel     : intercepts mouse-wheel events for the lerp
   wheelMultiplier : distance per notch (1 = browser default, 1.5 = 50% more)
   touchMultiplier : equivalent scaling for trackpad / touch input            */
const lenis = new Lenis({
  duration: 1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.5,
  touchMultiplier: 1.5,
});

/* ── Named tick function (matches demo pattern) ─────────────────────────────
   Using a named reference means it can be cleanly removed from the ticker
   if lenis.destroy() is ever called later.                                   */
function onTick(time) {
  lenis.raf(time * 1000);
}

/* ── Keep ScrollTrigger in sync with Lenis' virtual scroll position ─────────
   Without this, scroll-triggered animations fire at the wrong moment because
   ScrollTrigger reads window.scrollY, which Lenis updates asynchronously.    */
lenis.on('scroll', ScrollTrigger.update);

/* ── Drive Lenis from GSAP's RAF ticker ─────────────────────────────────────
   Lenis and all GSAP animations now share one clock, so they never drift
   apart mid-animation.                                                        */
gsap.ticker.add(onTick);

/* ── Disable GSAP lag compensation ─────────────────────────────────────────
   After a freeze GSAP would silently skip time, which desynchronises Lenis.
   Setting this to 0 keeps them locked together at all times.                 */
gsap.ticker.lagSmoothing(0);

/* ── Iframe scroll fix ──────────────────────────────────────────────────────
   Iframes capture wheel events, breaking Lenis when the cursor drifts over
   a video embed mid-scroll. Pointer events are disabled on all iframes while
   the wheel is moving and restored 300 ms after the last wheel event.        */
const iframes = document.querySelectorAll('iframe');
let iframeTimer;

window.addEventListener('wheel', () => {
  iframes.forEach(f => f.style.pointerEvents = 'none');
  clearTimeout(iframeTimer);
  iframeTimer = setTimeout(() => {
    iframes.forEach(f => f.style.pointerEvents = '');
  }, 300);
}, { passive: true });
