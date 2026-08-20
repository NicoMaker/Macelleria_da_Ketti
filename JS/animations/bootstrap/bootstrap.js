// ─────────────────────────────────────────────────────────────
// animations-bootstrap.js — Avvio del motore di animazioni
// Dipende da: tutti i file animations-*.js precedenti
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  function init() {
    SiteAnimations.initHeader();
    SiteAnimations.initFloatingButtons();
    SiteAnimations.initSectionDividers();

    if (SiteAnimations.reduceMotion || !("IntersectionObserver" in window)) {
      document.body.classList.add("hero-loaded");
      return;
    }

    SiteAnimations.initHero();
    SiteAnimations.initParallax();
    SiteAnimations.initPageTransitions();
    SiteAnimations.scanForTargets(document);
    SiteAnimations.watchDynamicContent();

    // Rete di sicurezza: dopo 4s mostra ciò che è visibile ma non rivelato
    setTimeout(function () {
      document
        .querySelectorAll("[data-reveal]:not(.reveal-in)")
        .forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.classList.add("reveal-in");
          }
        });
    }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
