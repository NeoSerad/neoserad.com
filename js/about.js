const MEDIA = {
  films: [
    'Whiplash', 'Moneyball', 'The Big Short', 'Uncut Gems', '1917', 'Air',
    'Baby Driver', 'Bohemian Rhapsody', 'Chef', 'Ford v Ferrari',
    'Knives Out', 'Coach Carter', 'Parasite', 'Ratatouille', 'Spiderverse', 'Tag', 'The Social Network'
  ],
  shows: Array(16).fill('The Bear'),
  'video-games': [
    'The Beginners Guide',
    'VA-11 HALL-A: Cyberpunk Bartender Action',
    'Firewatch'
  ]
};

/* linear interpolation between #348660 (52,134,96) and #ADE078 (173,224,120) */
function randomGradientColor() {
  const t = Math.random();
  const r = Math.round(52  + (173 - 52)  * t);
  const g = Math.round(134 + (224 - 134) * t);
  const b = Math.round(96  + (120 - 96)  * t);
  return `rgb(${r},${g},${b})`;
}

/* live particle elements per trigger key */
const pool = {};

function dismiss(key) {
  if (!pool[key]?.length) return;
  pool[key].forEach(el => {
    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity:  0,
      duration: 0.3,
      ease:     'power1.in',
      onComplete: () => el.remove()
    });
  });
  pool[key] = [];
  document.body.classList.remove('media-active');
}

function explode(trigger) {
  const key = trigger.dataset.media;
  dismiss(key);
  document.body.classList.add('media-active');

  const rect  = trigger.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  const items = MEDIA[key];
  pool[key]   = [];

  items.forEach((name, i) => {
    const el = document.createElement('span');
    el.className   = 'media-particle';
    el.textContent = name;
    el.style.color = randomGradientColor();
    document.body.appendChild(el);
    pool[key].push(el);

    gsap.set(el, { xPercent: -50, yPercent: -50, x: cx, y: cy, opacity: 1, scale: 0.9 });

    const angle = (Math.PI * 2 / items.length) * i + (Math.random() - 0.5) * 0.5;
    const dist  = 160 + Math.random() * 220;

    /* fly out and hold — no automatic fade, dismissed on mouseleave */
    gsap.to(el, {
      x:        cx + Math.cos(angle) * dist,
      y:        cy + Math.sin(angle) * dist,
      scale:    0.55 + Math.random() * 0.45,
      rotation: (Math.random() - 0.5) * 22,
      duration: 0.5,
      ease:     'power2.out',
      delay:    i * 0.018,
    });
  });
}

document.querySelectorAll('.media-word').forEach(trigger => {
  trigger.addEventListener('mouseenter', () => explode(trigger));
  trigger.addEventListener('mouseleave', () => dismiss(trigger.dataset.media));
});
