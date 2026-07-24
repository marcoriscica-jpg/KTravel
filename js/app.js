import { animate, stagger } from "./vendor/motion.js";

const EASE = [0.22, 1, 0.36, 1];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    let menuBusy = false;

    const openMenu = () => {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      if (prefersReducedMotion) return Promise.resolve();
      const container = animate(menu, { opacity: [0, 1] }, { duration: 0.2 });
      const items = animate(
        menu.querySelectorAll("li"),
        { opacity: [0, 1], x: [-16, 0] },
        { duration: 0.35, delay: stagger(0.06), easing: EASE }
      );
      return Promise.all([container.finished, items.finished]);
    };

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      if (prefersReducedMotion) {
        menu.hidden = true;
        return Promise.resolve();
      }
      const items = animate(
        menu.querySelectorAll("li"),
        { opacity: [1, 0], x: [0, -16] },
        { duration: 0.2, delay: stagger(0.03) }
      );
      const container = animate(menu, { opacity: [1, 0] }, { duration: 0.25 });
      return Promise.all([items.finished, container.finished]).then(() => {
        menu.hidden = true;
      });
    };

    toggle.addEventListener("click", () => {
      if (menuBusy) return;
      menuBusy = true;
      const isOpen = !menu.hidden;
      (isOpen ? closeMenu() : openMenu()).finally(() => {
        menuBusy = false;
      });
    });
  }

  const heroTiles = document.querySelectorAll(".hero__tile");

  if (heroTiles.length && !prefersReducedMotion) {
    animate(
      heroTiles,
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.6, delay: stagger(0.1), easing: EASE }
    );
  }

  const setTileActive = (tile, active) => {
    const img = tile.querySelector(".hero__tile-img");
    const overlay = tile.querySelector(".hero__tile-overlay");
    const title = tile.querySelector(".hero__tile-title");
    const opts = prefersReducedMotion ? { duration: 0 } : { duration: 0.5, easing: EASE };

    animate(img, { scale: active ? 1.08 : 1 }, opts);
    animate(overlay, { backgroundColor: active ? "rgba(0, 0, 0, 0.28)" : "rgba(0, 0, 0, 0)" }, opts);
    animate(title, { opacity: active ? 1 : 0, y: active ? 0 : 8 }, opts);
  };

  const modal = document.getElementById("wizard-modal");
  const modalTitle = document.getElementById("wizard-modal-title");
  const modalPanel = modal?.querySelector(".wizard-modal__panel");
  const modalBackdrop = modal?.querySelector(".wizard-modal__backdrop");
  const modalCloseBtn = modal?.querySelector(".wizard-modal__close");
  let lastFocusedTile = null;

  const openWizardModal = (cluster, trigger) => {
    if (!modal) return;
    lastFocusedTile = trigger;
    modalTitle.textContent = cluster;
    modal.hidden = false;
    if (!prefersReducedMotion) {
      animate(modalBackdrop, { opacity: [0, 1] }, { duration: 0.25 });
      animate(modalPanel, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.3, easing: EASE });
    }
    modalCloseBtn?.focus();
  };

  const closeWizardModal = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    lastFocusedTile?.focus();
  };

  heroTiles.forEach((tile) => {
    tile.addEventListener("pointerenter", () => setTileActive(tile, true));
    tile.addEventListener("pointerleave", () => setTileActive(tile, false));
    tile.addEventListener("focus", () => setTileActive(tile, true));
    tile.addEventListener("blur", () => setTileActive(tile, false));
    tile.addEventListener("click", () => openWizardModal(tile.dataset.cluster, tile));
  });

  modal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-wizard-close]")) closeWizardModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeWizardModal();
  });

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.innerHTML = "<p>Grazie! Ti contatteremo a breve. (Demo — nessuna email inviata)</p>";
    });
  }
});
