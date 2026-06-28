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
