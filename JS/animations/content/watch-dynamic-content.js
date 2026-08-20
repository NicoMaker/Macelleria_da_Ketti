// ─────────────────────────────────────────────────────────────
// animations-watch-dynamic-content.js — Osserva card/footer generati dinamicamente
// Dipende da: animations-state.js, animations-scroll-reveal.js
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  SiteAnimations.watchDynamicContent = function () {
    var mo = new MutationObserver(function (mutations) {
      var added = false;
      mutations.forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) added = true;
      });
      if (added) SiteAnimations.scanForTargets(document);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("prodottiCaricati", function () {
      setTimeout(function () {
        SiteAnimations.scanForTargets(document);
      }, 50);
    });
  };
})();
