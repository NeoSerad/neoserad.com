/* ============================================================
   NEOSERAD — main.js
   Handles: dark mode default, theme toggle, custom cursor,
            nav scroll state, GSAP animations
   Requires: GSAP core + ScrollTrigger (loaded in index.html)
   ============================================================ */


/* ------------------------------------------------------------
   DARK MODE
   Dark is the default on first load. The user's preference is
   saved to localStorage so it persists across pages and visits.
   ------------------------------------------------------------ */
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

/* On load — apply saved preference, or default to dark */
const savedTheme = localStorage.getItem('theme') || 'dark';
html.classList.toggle('dark', savedTheme === 'dark');
themeToggle.textContent = savedTheme === 'dark' ? '☀' : '☾';


/* Toggle on click — flips the class and saves the new preference */
themeToggle.addEventListener('click', () => {
  const isDark = html.classList.toggle('dark');
  themeToggle.textContent = isDark ? '☀' : '☾';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});




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
const moveCursorX = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3.out' });
const moveCursorY = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3.out' });

window.addEventListener('mousemove', (e) => {
  moveCursorX(e.clientX);
  moveCursorY(e.clientY);
});

/* Cursor expands over any element with data-cursor="view" */
document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
});

/* Hide the default system cursor site-wide */
document.body.style.cursor = 'none';


/* ------------------------------------------------------------
   NAV SLIDING INDICATOR
   A single absolutely-positioned line sits under the active link.
   On hover it slides to the hovered link; on mouse out it returns
   to the active link. GSAP drives all movement.
   ------------------------------------------------------------ */
const navLinks     = document.querySelectorAll('.nav__link');
const navLinksList = document.querySelector('.nav__links');
const activeLink   = document.querySelector('.nav__link.active');

/* Create the indicator element and inject it into .nav__links */
const indicator = document.createElement('div');
indicator.className = 'nav__indicator';
navLinksList.appendChild(indicator);

/* Move the indicator to sit under a given link element */
function moveIndicatorTo(el) {
  const listRect = navLinksList.getBoundingClientRect();
  const linkRect = el.getBoundingClientRect();

  gsap.to(indicator, {
    x: linkRect.left - listRect.left,  /* offset from .nav__links left edge */
    width: linkRect.width,
    duration: 0.35,
    ease: 'power3.out',
  });
}

/* Set initial position under the active link with no animation */
if (activeLink) {
  const listRect = navLinksList.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  gsap.set(indicator, {
    x: linkRect.left - listRect.left,
    width: linkRect.width,
  });
}

/* Slide to hovered link — return to active on mouse out */
navLinks.forEach((link) => {
  link.addEventListener('mouseenter', () => moveIndicatorTo(link));
  link.addEventListener('mouseleave', () => {
    if (activeLink) moveIndicatorTo(activeLink);
  });
});



/* ------------------------------------------------------------
   NAV SCROLL STATE
   Adds .scrolled to the nav once the user scrolls past the
   10%–20% fade window. Simple class toggle — CSS handles
   the background and colour transition.
   ------------------------------------------------------------ */
const nav = document.getElementById('nav');

function getScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = window.scrollY / scrollable;
  const fadeStart = 0.10;
  const fadeEnd   = 0.20;
  return Math.min(1, Math.max(0, (progress - fadeStart) / (fadeEnd - fadeStart)));
}

function updateNav() {
  const p = getScrollProgress();
  /* .scrolled triggers the CSS background and colour transition */
  nav.classList.toggle('scrolled', p >= 1);
}

window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav, { passive: true });


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