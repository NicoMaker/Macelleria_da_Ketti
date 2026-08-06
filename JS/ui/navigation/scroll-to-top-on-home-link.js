// ─────────────────────────────────────────────────────────────────────────────
// scroll-to-top-on-home-link.js — Scroll fluido in cima quando si clicca "#Home"
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const homeLinks = document.querySelectorAll('a[href="#Home"]');

  homeLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Chiudi eventuale menu mobile aperto (facoltativo)
      const mobileMenu = document.querySelector(".mobile-menu");
      const toggle = document.querySelector(".mobile-menu-toggle");
      if (mobileMenu && toggle && mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active");
        toggle.classList.remove("active");
      }

      // Scrolla all'inizio della pagina, sopra la hero
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
});
