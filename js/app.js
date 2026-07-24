document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.innerHTML = "<p>Grazie! Ti contatteremo a breve. (Demo — nessuna email inviata)</p>";
    });
  }
});
