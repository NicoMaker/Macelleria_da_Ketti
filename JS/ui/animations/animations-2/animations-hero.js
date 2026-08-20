// ─────────────────────────────────────────────────────────────
// animations-hero.js — Hero con entrata orchestrata
// Dipende da: animations-state.js
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  SiteAnimations.initHero = function () {
    if (!document.querySelector(".hero-section")) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add("hero-loaded");
      });
    });
  };
})();
