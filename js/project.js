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

const savedTheme = localStorage.getItem('theme') || 'light';
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
const singleEls = [
  '.nav',
  '.project-hero__label',
  '.project-hero__title',
  '.project-hero__quote',
  '.project-hero__brief',
  '.project-embed-section',
  '.project-body',
  '.project-back-section',
  '.about-layout',
  '.about-cta-section',
  '.footer',
].map(sel => document.querySelector(sel)).filter(Boolean);

const multiEls = [...document.querySelectorAll('.project-gifs-section')];

const enterEls = [...singleEls, ...multiEls].sort((a, b) => {
  const pos = Node.DOCUMENT_POSITION_FOLLOWING;
  return a.compareDocumentPosition(b) & pos ? -1 : 1;
});

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
   BTS DRAWER — click the label to expand / collapse
   Open all drawers by default on load (no animation — entrance
   animation handles the initial reveal).
   ------------------------------------------------------------ */
document.querySelectorAll('.project-gifs__toggle').forEach(toggle => {
  const drawer = toggle.closest('section').querySelector('.project-gifs__drawer');
  const grid   = drawer.querySelector('.project-gifs, .project-gifs__content');

  toggle.classList.add('is-open');
  gsap.set(drawer, { height: 'auto' });
  gsap.set(grid,   { opacity: 1 });

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('is-open');

    if (isOpen) {
      toggle.classList.remove('is-open');
      gsap.to(grid,   { opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(drawer, { height: 0,  duration: 0.45, delay: 0.1, ease: 'power3.inOut' });
    } else {
      toggle.classList.add('is-open');
      gsap.set(grid, { opacity: 0 });
      gsap.fromTo(drawer,
        { height: 0 },
        {
          height: drawer.scrollHeight,
          duration: 0.45,
          ease: 'power3.inOut',
          onComplete() { drawer.style.height = 'auto'; },
        }
      );
      gsap.to(grid, { opacity: 1, duration: 0.3, delay: 0.25, ease: 'power2.out' });
    }
  });
});


/* ------------------------------------------------------------
   PAGE EXIT — Fade to background colour before any page
   navigation. Covers: Work/Back links (#work), and all other
   nav links (About, Contact). Active link is skipped.
   ------------------------------------------------------------ */
function fadeToPage(href) {
  const t  = localStorage.getItem('theme') || 'light';
  const ol = document.createElement('div');
  ol.style.cssText = 'position:fixed;inset:0;z-index:9998;background:' +
                     (t === 'dark' ? '#071610' : '#FCFFF2') +
                     ';opacity:0;pointer-events:none';
  document.body.appendChild(ol);
  gsap.to(ol, { opacity: 1, duration: 0.4, ease: 'power2.in',
    onComplete: () => { window.location.href = href; } });
}

document.querySelectorAll('a[href*="#work"], .nav__link:not(.active):not([href*="#work"])').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    fadeToPage(link.getAttribute('href'));
  });
});


/* ------------------------------------------------------------
   COPY EMAIL — Copies email to clipboard and shows a tooltip.
   dir 'up': appears above (CTA button).
   dir 'right': emerges from the right (footer icon).
   ------------------------------------------------------------ */
function showCopiedTooltip(anchor, dir) {
  navigator.clipboard.writeText(anchor.dataset.copyEmail);
  document.querySelectorAll('.copy-tooltip').forEach(t => t.remove());

  const tip = document.createElement('span');
  tip.className = 'copy-tooltip';
  tip.textContent = 'Copied!';
  document.body.appendChild(tip);

  const rect = anchor.getBoundingClientRect();

  if (dir === 'right') {
    gsap.set(tip, {
      left: rect.right + 8,
      top:  rect.top + rect.height / 2,
      yPercent: -50,
      x: -8,
      opacity: 0,
    });
    gsap.to(tip, {
      x: 0,
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
      onComplete() {
        gsap.to(tip, { opacity: 0, x: 12, duration: 0.3, delay: 1, ease: 'power2.in', onComplete: () => tip.remove() });
      },
    });
  } else {
    gsap.set(tip, {
      left: rect.left + rect.width / 2,
      top:  rect.top,
      xPercent: -50,
      yPercent: -100,
      y: 0,
      opacity: 0,
    });
    gsap.to(tip, {
      y: -16,
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
      onComplete() {
        gsap.to(tip, { opacity: 0, y: -44, duration: 0.3, delay: 1, ease: 'power2.in', onComplete: () => tip.remove() });
      },
    });
  }
}

const ctaBtn = document.querySelector('.about-cta[data-copy-email]');
if (ctaBtn) {
  ctaBtn.addEventListener('click', e => { e.preventDefault(); showCopiedTooltip(ctaBtn, 'up'); });
}

document.querySelectorAll('.footer__icon[data-copy-email]').forEach(icon => {
  icon.addEventListener('click', e => { e.preventDefault(); showCopiedTooltip(icon, 'right'); });
});


/* ------------------------------------------------------------
   CLIP GRID HOVER — Pause the hovered clip and dim the others.
   Skipped on vanilla-page which has its own hover behaviour.
   ------------------------------------------------------------ */
const clipVideos = document.querySelectorAll('.project-gif video');
if (clipVideos.length && !document.body.classList.contains('vanilla-page')) {
  clipVideos.forEach(video => {
    video.addEventListener('mouseenter', () => {
      video.pause();
      clipVideos.forEach(other => {
        if (other !== video) gsap.to(other, { opacity: 0.2, duration: 0.3, ease: 'power2.out' });
      });
    });
    video.addEventListener('mouseleave', () => {
      video.play();
      clipVideos.forEach(other => {
        if (other !== video) gsap.to(other, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      });
    });
  });
}
