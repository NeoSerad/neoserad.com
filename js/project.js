/* ============================================================
   NEOSERAD — project.js
   Handles: dark mode, custom cursor, nav indicator, nav scroll.
   Used by project pages — does not depend on the reel section.
   ============================================================ */


/* ------------------------------------------------------------
   DARK MODE
   ------------------------------------------------------------ */
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

const savedTheme = localStorage.getItem('theme') || 'dark';
html.classList.toggle('dark', savedTheme === 'dark');
themeToggle.textContent = savedTheme === 'dark' ? '☀' : '☾';

themeToggle.addEventListener('click', () => {
  const isDark = html.classList.toggle('dark');
  themeToggle.textContent = isDark ? '☀' : '☾';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


/* ------------------------------------------------------------
   SETUP
   ------------------------------------------------------------ */
gsap.registerPlugin(ScrollTrigger, CustomEase);


/* ------------------------------------------------------------
   CUSTOM CURSOR
   ------------------------------------------------------------ */
const cursor = document.getElementById('cursor');

const moveCursorX = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3.out' });
const moveCursorY = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3.out' });

window.addEventListener('mousemove', (e) => {
  moveCursorX(e.clientX);
  moveCursorY(e.clientY);
});

document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
});

/* Hide custom cursor over the Vimeo embed — the iframe swallows
   mousemove events, which would leave the dot frozen on the border. */
const embed = document.querySelector('.project-embed');
if (embed) {
  embed.addEventListener('mouseenter', () => cursor.style.opacity = '0');
  embed.addEventListener('mouseleave', () => cursor.style.opacity = '1');
}

document.body.style.cursor = 'none';


/* ------------------------------------------------------------
   NAV SLIDING INDICATOR
   ------------------------------------------------------------ */
const navLinks     = document.querySelectorAll('.nav__link');
const navLinksList = document.querySelector('.nav__links');
const activeLink   = document.querySelector('.nav__link.active');

const indicator = document.createElement('div');
indicator.className = 'nav__indicator';
navLinksList.appendChild(indicator);

function moveIndicatorTo(el) {
  const listRect = navLinksList.getBoundingClientRect();
  const linkRect = el.getBoundingClientRect();

  gsap.to(indicator, {
    x: linkRect.left - listRect.left,
    width: linkRect.width,
    duration: 0.35,
    ease: 'power3.out',
  });
}

if (activeLink) {
  const listRect = navLinksList.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  gsap.set(indicator, {
    x: linkRect.left - listRect.left,
    width: linkRect.width,
  });
}

navLinks.forEach((link) => {
  link.addEventListener('mouseenter', () => moveIndicatorTo(link));
  link.addEventListener('mouseleave', () => {
    if (activeLink) moveIndicatorTo(activeLink);
  });
});


/* ------------------------------------------------------------
   NAV SCROLL STATE
   Goes solid once the user scrolls 80px — no reel dependency.
   ------------------------------------------------------------ */
const nav = document.getElementById('nav');

function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}

window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav, { passive: true });


/* ------------------------------------------------------------
   PAGE ENTRANCE TRANSITION
   All sections start hidden and stagger in top-to-bottom,
   matching the exit animation on the home page.
   ------------------------------------------------------------ */
const enterEls = [
  '.nav',
  '.project-hero__label',
  '.project-hero__title',
  '.project-hero__quote',
  '.project-hero__brief',
  '.project-embed-section',
  '.project-body',
  '.project-gifs-section',
  '.project-back-section',
  '.footer',
].map(sel => document.querySelector(sel)).filter(Boolean);

gsap.set(enterEls, { opacity: 0, y: 24 });

gsap.to(enterEls, {
  opacity: 1,
  y: 0,
  duration: 0.55,
  stagger: 0.09,
  ease: 'power3.out',
  delay: 0.1,
});


/* ------------------------------------------------------------
   PAGE EXIT — Intercept clicks on any link pointing back to
   #work. Fade the page to the background colour, then navigate.
   The landing page's inline script will create the same overlay
   on arrival, hiding the instant scroll-to-grid.
   ------------------------------------------------------------ */
document.querySelectorAll('a[href*="#work"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    const t    = localStorage.getItem('theme') || 'dark';
    const ol   = document.createElement('div');
    ol.style.cssText = 'position:fixed;inset:0;z-index:9998;background:' +
                       (t === 'dark' ? '#071610' : '#FCFFF2') +
                       ';opacity:0;pointer-events:none';
    document.body.appendChild(ol);
    gsap.to(ol, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => { window.location.href = href; },
    });
  });
});
