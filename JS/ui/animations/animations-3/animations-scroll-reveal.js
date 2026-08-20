// ─────────────────────────────────────────────────────────────
// animations-scroll-reveal.js — Reveal allo scroll (anche su card generate dal JS)
// Dipende da: animations-state.js
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  function getObserver() {
    if (SiteAnimations.observer) return SiteAnimations.observer;
    SiteAnimations.observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            SiteAnimations.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    return SiteAnimations.observer;
  }

  function markReveal(el, type, index) {
    if (el.hasAttribute("data-reveal")) return;
    el.setAttribute("data-reveal", type || "up");
    if (typeof index === "number") {
      el.style.setProperty("--reveal-index", String(index % 6));
    }
    getObserver().observe(el);
  }

  function scanForTargets(root) {
    root = root || document;

    // Titoli e sottotitoli: reveal con sfocatura
    root
      .querySelectorAll(".section-title, .section-subtitle")
      .forEach(function (el) {
        markReveal(el, "blur");
      });

    // Bottoni CTA nelle sezioni
    root.querySelectorAll("section .hero-cta-container").forEach(function (el) {
      markReveal(el, "up");
    });

    // Storia: immagine da sinistra, testo da destra
    root.querySelectorAll(".about-image").forEach(function (el) {
      markReveal(el, "left");
    });
    root.querySelectorAll(".about-text").forEach(function (el) {
      markReveal(el, "right");
    });

    // Feature cards con stagger
    root
      .querySelectorAll(".features-grid .feature-card")
      .forEach(function (el, i) {
        markReveal(el, "up", i);
      });

    // Card prodotti e novità (generate dal JS del sito) con stagger
    root
      .querySelectorAll(".novita-container, .progetti-container")
      .forEach(function (grid) {
        Array.prototype.forEach.call(grid.children, function (card, i) {
          markReveal(card, "up", i);
          var img = card.querySelector("img");
          if (img && !img.hasAttribute("data-reveal-img")) {
            img.setAttribute("data-reveal-img", "");
          }
        });
      });

    // Pagina prodotto
    root
      .querySelectorAll(".product-image-gallery, .slider-container")
      .forEach(function (el) {
        markReveal(el, "left");
      });
    root.querySelectorAll(".product-info").forEach(function (el) {
      markReveal(el, "right");
    });

    // Footer
    root
      .querySelectorAll(".footer-grid > .footer-section, .footer-grid > *")
      .forEach(function (el, i) {
        markReveal(el, "up", i);
      });
  }

  SiteAnimations.scanForTargets = scanForTargets;
  SiteAnimations.markReveal = markReveal;
  SiteAnimations.getRevealObserver = getObserver;
})();
