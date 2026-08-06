// ─────────────────────────────────────────────────────────────────────────────
// closure-banner-bootstrap.js — Entry point del banner chiusure hero
// Dipende da: closure-banner-wait-for-data.js, closure-banner-render.js
// ─────────────────────────────────────────────────────────────────────────────

HeroClosureBanner.waitForJsonData(function () {
  document.addEventListener("DOMContentLoaded", HeroClosureBanner.render);
});
