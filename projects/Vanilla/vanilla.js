/* ------------------------------------------------------------
   LAZY VIDEO LOADING
   Individual videos are observed directly. Carousel videos sit
   off-screen horizontally (overflow: hidden), so the carousel
   container is observed instead and all three load together.
   ------------------------------------------------------------ */
function loadVideo(video) {
  if (!video.dataset.src) return;
  video.src = video.dataset.src;
  delete video.dataset.src;
  video.load();
  video.play().catch(() => {});
}

const lazyObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (el.tagName === 'VIDEO') {
      loadVideo(el);
    } else {
      el.querySelectorAll('video[data-src]').forEach(loadVideo);
    }
    obs.unobserve(el);
  });
}, { rootMargin: '200px 0px' });

const carouselContainer = document.getElementById('vanilla-carousel');

document.querySelectorAll('.vanilla-page video[data-src]').forEach(video => {
  if (carouselContainer && carouselContainer.contains(video)) return;
  lazyObserver.observe(video);
});

if (carouselContainer) lazyObserver.observe(carouselContainer);


/* ------------------------------------------------------------
   LOGO ANIMATION CAROUSEL
   ------------------------------------------------------------ */
const carousel = document.getElementById('vanilla-carousel');
if (carousel) {
  const track   = carousel.querySelector('.vanilla-carousel__track');
  const prevBtn = carousel.querySelector('.vanilla-carousel__btn--prev');
  const nextBtn = carousel.querySelector('.vanilla-carousel__btn--next');
  const total   = carousel.querySelectorAll('.vanilla-carousel__item').length;
  let current   = 0;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * carousel.offsetWidth}px)`;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => goTo(current));
}


/* ------------------------------------------------------------
   VANILLA LOGOS — match star height to wordmark rendered height.
   ------------------------------------------------------------ */
const wordmark = document.querySelector('.vanilla-page .project-body__media img:first-child');
const star     = document.querySelector('.vanilla-page .project-body__media img:last-child');

if (wordmark && star) {
  const matchHeight = () => {
    star.style.height = wordmark.offsetHeight + 'px';
    star.style.width  = 'auto';
  };
  wordmark.complete ? matchHeight() : wordmark.addEventListener('load', matchHeight);
  window.addEventListener('resize', matchHeight);
}


/* ------------------------------------------------------------
   SEAMLESS LOOP — seek back just before the end to avoid the
   black frame the browser inserts between native loop cycles.
   Uses a flag + the 'seeked' event so play() fires only once
   the seek is fully committed.
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


/* ------------------------------------------------------------
   VANILLA — clip grid hover
   On hover: restart with audio + dim siblings.
   On leave: mute + restore siblings.
   ------------------------------------------------------------ */
const vanillaGifs = document.querySelectorAll('.vanilla-page .project-gif');
const vanillaVideos = [...vanillaGifs].map(el => el.querySelector('video'));

vanillaGifs.forEach((gif, i) => {
  const video = vanillaVideos[i];

  gif.addEventListener('mouseenter', () => {
    video.currentTime = 0;
    video.muted = false;
    video.play();

    vanillaGifs.forEach((other, j) => {
      if (j !== i) gsap.to(other, { opacity: 0.2, duration: 0.3, ease: 'power2.out' });
    });
  });

  gif.addEventListener('mouseleave', () => {
    video.muted = true;

    vanillaGifs.forEach((other, j) => {
      if (j !== i) gsap.to(other, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    });
  });
});
