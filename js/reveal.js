// reveal.js — fade-in on-scroll, stesso pattern usato su bokun.io
// Versione SENZA bundler: richiede che gsap e ScrollTrigger siano già
// caricati via <script> CDN PRIMA di questo file (vedi index.html).

gsap.registerPlugin(ScrollTrigger);

function initReveal() {
  const elements = document.querySelectorAll(".reveal");

  elements.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out", // curva equivalente a quella osservata (1 - (1-t)^n)
      scrollTrigger: {
        trigger: el,
        start: "top 85%", // l'elemento entra in animazione all'85% del viewport
        toggleActions: "play none none reverse",
        // markers: true, // scommenta per debug visivo delle soglie
      },
    });
  });
}

// Auto-init se importato direttamente in pagina (rimuovi se preferisci
// chiamare initReveal() manualmente dal tuo entry point)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initReveal);
}
