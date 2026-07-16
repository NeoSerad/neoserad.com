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

/* On load — apply saved preference, or default to light */
const savedTheme = localStorage.getItem('theme') || 'light';
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
gsap.registerPlugin(ScrollTrigger, CustomEase);



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
/* ------------------------------------------------------------
   REEL SCROLL CUE
   Fades in after 10 s, hides once the user scrolls.
   ------------------------------------------------------------ */
const reelCue = document.getElementById('reel-cue');

setTimeout(() => {
  if (window.scrollY < 20) reelCue.classList.add('is-visible');
}, 10000);

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) reelCue.classList.add('is-hidden');
  else reelCue.classList.remove('is-hidden');
}, { passive: true });


/* ------------------------------------------------------------
   NAV SCROLL STATE
   Threshold based on reel height so .scrolled only fires once
   the visitor has scrolled past the video into the content.
   ------------------------------------------------------------ */
const nav = document.getElementById('nav');

function updateNav() {
  const reelHeight = document.getElementById('reel').offsetHeight;
  const fadeStart  = reelHeight * 0.90;
  const fadeEnd    = reelHeight * 1.05;
  const p = Math.min(1, Math.max(0, (window.scrollY - fadeStart) / (fadeEnd - fadeStart)));
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
   WIGGLE — "move" letters animate when the heading enters view
   ------------------------------------------------------------ */
const wiggleLetters = document.querySelectorAll('.wiggle-letter');

/* Motion curves */
const EASE_UP   = 'cubic-bezier(.59,.02,.96,.36)';
const EASE_DOWN = 'cubic-bezier(.29,.72,.66,1.36)';
const EASE_REST = 'cubic-bezier(.24,.67,.4,.97)';

function playWiggle() {
  const tl = gsap.timeline();

  tl.to(wiggleLetters, {
    color: '#28CC4B',
    duration: 0.18,
    stagger: 0.06,
    ease: 'power2.out',
  }, 0);

  tl.to(wiggleLetters, {
    color: 'inherit',
    duration: 0.55,
    stagger: 0.06,
    ease: 'power2.in',
  }, 0.35);

  tl.to(wiggleLetters, {
    y: -10,
    duration: 0.18,
    stagger: 0.07,
    ease: EASE_UP,
  }, 0);

  tl.to(wiggleLetters, {
    y: 6,
    duration: 0.18,
    stagger: 0.07,
    ease: EASE_DOWN,
  }, 0.22);

  tl.to(wiggleLetters, {
    y: 0,
    duration: 0.3,
    stagger: 0.07,
    ease: EASE_REST,
  }, 0.44);
}

/* IntersectionObserver fires reliably in both scroll directions
   regardless of the scroll position at initialisation time — unlike
   ScrollTrigger, whose onEnterBack misfires when the page loads
   already scrolled to #work. */
const wiggleObserver = new IntersectionObserver(
  ([entry]) => { if (entry.isIntersecting) playWiggle(); },
  { rootMargin: '0px 0px -30% 0px', threshold: 0 }
);
wiggleObserver.observe(document.querySelector('.hero__heading'));


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


/* ------------------------------------------------------------
   CARD CLICK — EXIT TRANSITION
   Fades out all other elements, moves the clicked card to the
   centre of the viewport, scales it up 50%, then navigates.
   ------------------------------------------------------------ */
let transitioning = false;

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (transitioning) return;
    e.preventDefault();
    transitioning = true;

    /* Lock all interaction for the duration of the animation */
    document.body.style.pointerEvents = 'none';

    const href = card.getAttribute('href');
    const otherCards = [...document.querySelectorAll('.card')].filter(c => c !== card);

    /* Delta to translate the card's centre to the viewport centre */
    const rect = card.getBoundingClientRect();
    const dx = window.innerWidth  / 2 - (rect.left + rect.width  / 2);
    const dy = window.innerHeight / 2 - (rect.top  + rect.height / 2);

    const tl = gsap.timeline({
      onComplete: () => { window.location.href = href; },
    });

    /* Step 1 — fade out everything except the clicked card */
    tl.to(
      [nav, document.querySelector('.hero'), document.querySelector('.grid__label'), document.querySelector('#landing-embed'), document.querySelector('.footer'), ...otherCards].filter(Boolean),
      { opacity: 0, duration: 0.35, ease: 'power2.out' }
    );

    /* Step 2 — slide card to viewport centre */
    tl.to(card, { x: dx, y: dy, duration: 0.55, ease: 'power3.inOut' });

    /* Step 3 — scale up 50% and fade out, then navigate */
    tl.to(card, { scale: 1.5, opacity: 0, duration: 0.4, ease: 'power2.in' });
  });
});


/* ------------------------------------------------------------
   NAV PAGE EXIT — Fade out before navigating to About / Contact.
   Anchor-only links (#work) are excluded — those just scroll.
   ------------------------------------------------------------ */
function fadeToPage(href) {
  const t  = localStorage.getItem('theme') || 'light';
  const ol = document.createElement('div');
  ol.setAttribute('data-exit-overlay', '');
  ol.style.cssText = 'position:fixed;inset:0;z-index:9998;background:' +
                     (t === 'dark' ? '#071610' : '#FCFFF2') +
                     ';opacity:0;pointer-events:none';
  document.body.appendChild(ol);
  gsap.to(ol, { opacity: 1, duration: 0.4, ease: 'power2.in',
    onComplete: () => { window.location.href = href; } });
}

document.querySelectorAll('.nav__link').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return;
  link.addEventListener('click', e => { e.preventDefault(); fadeToPage(href); });
});

/* Bfcache restore — browser back restores a frozen snapshot that may have:
   - A full-opacity exit overlay covering the page
   - All elements at opacity:0 / transformed from the card click animation
   - body pointer-events:none and transitioning=true (interaction locked)
   Clear everything so the page is fully visible and interactive again. */
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.querySelectorAll('[data-exit-overlay]').forEach(el => el.remove());
  document.body.style.pointerEvents = '';
  transitioning = false;
  const resetEls = [
    nav,
    document.querySelector('.hero'),
    document.querySelector('.grid__label'),
    document.querySelector('#landing-embed'),
    document.querySelector('.footer'),
    ...document.querySelectorAll('.card'),
  ].filter(Boolean);
  gsap.set(resetEls, { clearProps: 'all' });
});


/* ------------------------------------------------------------
   OVERLAY FADE — Arriving from a project page via the Work /
   Back link. The inline script in <head> created the overlay
   before first paint. Scroll into position while it covers the
   page, then fade it out to reveal the grid.
   ------------------------------------------------------------ */
const overlay = document.getElementById('page-overlay');
if (overlay) {
  document.getElementById('work')?.scrollIntoView({ behavior: 'instant' });
  gsap.to(overlay, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.15,
    onComplete: () => overlay.remove(),
  });
}


/* ------------------------------------------------------------
   COPY EMAIL — Footer icon copies email and shows a tooltip
   emerging to the right of the icon.
   ------------------------------------------------------------ */
function showCopiedTooltip(anchor) {
  navigator.clipboard.writeText(anchor.dataset.copyEmail);
  document.querySelectorAll('.copy-tooltip').forEach(t => t.remove());

  const tip = document.createElement('span');
  tip.className = 'copy-tooltip';
  tip.textContent = 'Copied!';
  document.body.appendChild(tip);

  const rect = anchor.getBoundingClientRect();
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
}

document.querySelectorAll('.footer__icon[data-copy-email]').forEach(icon => {
  icon.addEventListener('click', e => { e.preventDefault(); showCopiedTooltip(icon); });
});


/* ------------------------------------------------------------
   SEAMLESS LOOP
   Seeks back 0.2 s before the video ends to prevent the black
   frame the browser inserts between native loop iterations.
   ------------------------------------------------------------ */
document.querySelectorAll('video[data-seamless-loop]').forEach(video => {
  let seeking = false;
  video.addEventListener('timeupdate', () => {
    if (!seeking && video.duration && video.currentTime >= video.duration - 0.2) {
      seeking = true;
      video.currentTime = 0;
    }
  });
  video.addEventListener('seeked', () => {
    if (seeking) {
      seeking = false;
      video.play();
    }
  });
});
