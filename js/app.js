import { animate, stagger } from "./vendor/motion.js";

const EASE = [0.22, 1, 0.36, 1];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobile-menu");

  const menuBackground = menu?.querySelector(".mobile-menu__background");
  const menuItems = () => menu.querySelectorAll(".mobile-menu__list li");
  const iconTop = toggle?.querySelector(".nav-toggle__bar--top");
  const iconMid = toggle?.querySelector(".nav-toggle__bar--mid");
  const iconBottom = toggle?.querySelector(".nav-toggle__bar--bottom");

  if (toggle && menu) {
    let menuToggleGeneration = 0;
    let menuIsOpen = false;

    const menuOrigin = () => {
      const rect = toggle.getBoundingClientRect();
      return {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
        maxRadius: Math.ceil(Math.hypot(window.innerWidth, window.innerHeight)),
      };
    };

    const morphIcon = (open) => {
      const opts = prefersReducedMotion ? { duration: 0 } : { duration: 0.3, easing: EASE };
      animate(iconTop, { rotate: open ? 45 : 0, y: open ? 7 : 0 }, opts);
      animate(iconMid, { opacity: open ? 0 : 1 }, opts);
      animate(iconBottom, { rotate: open ? -45 : 0, y: open ? -7 : 0 }, opts);
    };

    const openMenu = () => {
      menuIsOpen = true;
      const generation = ++menuToggleGeneration;
      const { x, y, maxRadius } = menuOrigin();
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      morphIcon(true);
      if (prefersReducedMotion) return Promise.resolve();
      const bg = animate(
        menuBackground,
        { clipPath: [`circle(30px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
        { type: "spring", stiffness: 20, restDelta: 2 }
      );
      const items = animate(
        menuItems(),
        { opacity: [0, 1], y: [50, 0] },
        { delay: stagger(0.07, { startDelay: 0.2 }), y: { type: "spring", stiffness: 1000, velocity: -100 } }
      );
      return Promise.all([bg.finished, items.finished]).catch(() => {});
    };

    const closeMenu = () => {
      menuIsOpen = false;
      const generation = ++menuToggleGeneration;
      const { x, y, maxRadius } = menuOrigin();
      toggle.setAttribute("aria-expanded", "false");
      morphIcon(false);
      document.body.style.overflow = "";
      if (prefersReducedMotion) {
        menu.hidden = true;
        return Promise.resolve();
      }
      const items = animate(
        menuItems(),
        { opacity: [1, 0], y: [0, 50] },
        { delay: stagger(0.05, { from: "last" }), y: { type: "spring", stiffness: 1000 } }
      );
      const bg = animate(
        menuBackground,
        { clipPath: [`circle(${maxRadius}px at ${x}px ${y}px)`, `circle(30px at ${x}px ${y}px)`] },
        { delay: 0.2, type: "spring", stiffness: 400, damping: 40 }
      );
      return Promise.all([items.finished, bg.finished]).then(() => {
        // Ignore a stale close if the menu was reopened in the meantime.
        if (generation === menuToggleGeneration) menu.hidden = true;
      });
    };

    toggle.addEventListener("click", () => {
      menuIsOpen ? closeMenu() : openMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuIsOpen) closeMenu();
    });
  }

  const header = document.querySelector(".site-header");
  if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY;
      const headerHeight = header.offsetHeight;
      if (currentY <= headerHeight || currentY < lastScrollY) {
        header.classList.remove("site-header--hidden");
      } else if (currentY > lastScrollY) {
        header.classList.add("site-header--hidden");
      }
      lastScrollY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
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
