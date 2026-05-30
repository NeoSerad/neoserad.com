/* ============================================================
   NEOSERAD — main.js
   Handles: custom cursor, nav scroll state, GSAP animations
   Requires: GSAP core + ScrollTrigger (loaded in index.html)
   ============================================================ */


/* ------------------------------------------------------------
   SETUP
   Register the ScrollTrigger plugin with GSAP before use.
   ------------------------------------------------------------ */
gsap.registerPlugin(ScrollTrigger);


/* ------------------------------------------------------------
   CUSTOM CURSOR
   Tracks mouse position using GSAP's quickTo for silky smooth
   movement with a slight lag — feels more alive than CSS alone.
   ------------------------------------------------------------ */
const cursor = document.getElementById('cursor');

/* quickTo creates an optimised setter for a single property */
const moveCursorX = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3.out' });
const moveCursorY = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3.out' });

window.addEventListener('mousemove', (e) => {
  moveCursorX(e.clientX);
  moveCursorY(e.clientY);
});

/* Cursor expands and turns green over any element with data-cursor="view" */
document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
});

/* Hide the default system cursor site-wide */
document.body.style.cursor = 'none';


/* ------------------------------------------------------------
   NAV SCROLL STATE
   Adds .scrolled to the nav once the user scrolls past 10px.
   This triggers the subtle bottom border defined in the CSS.
   ------------------------------------------------------------ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });  /* passive: true improves scroll performance */


/* ------------------------------------------------------------
   HERO ENTRANCE
   Staggers the label and heading in on page load.
   Starts slightly below and fades up.
   ------------------------------------------------------------ */
gsap.from('.hero__label', {
  opacity: 0,
  y: 16,
  duration: 0.8,
  ease: 'power3.out',
  delay: 0.2,
});

gsap.from('.hero__heading', {
  opacity: 0,
  y: 24,
  duration: 1,
  ease: 'power3.out',
  delay: 0.4,  /* slight stagger after the label */
});


/* ------------------------------------------------------------
   PROJECT GRID — SCROLL REVEAL
   Each card animates in as it enters the viewport.
   ScrollTrigger watches each card individually and fires once.
   ------------------------------------------------------------ */
document.querySelectorAll('.card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',

    scrollTrigger: {
      trigger: card,        /* watch this specific card */
      start: 'top 88%',     /* fire when card top hits 88% down the viewport */
      once: true,           /* only animate in once, never reverse */
    },

    /* Stagger cards that appear at the same time (first two on load) */
    delay: i < 2 ? i * 0.1 : 0,
  });
});
