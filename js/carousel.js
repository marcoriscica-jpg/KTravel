// carousel.js — init Swiper, stesso pattern usato per il carosello
// testimonianze di bokun.io
// Versione SENZA bundler: richiede che Swiper sia già caricato via
// <script> CDN PRIMA di questo file (vedi index.html).

function initCarousel(selector = ".swiper") {
  const root = document.querySelector(selector);
  if (!root) return null;

  return new Swiper(selector, {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    speed: 500,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".reviews__nav--next",
      prevEl: ".reviews__nav--prev",
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => initCarousel());
}
