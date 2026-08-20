// ─────────────────────────────────────────────────────────────
// animations-header-progress.js — Header che si compatta + barra progresso
// Dipende da: animations-state.js
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  SiteAnimations.initHeader = function () {
    var header = document.querySelector(".site-header");
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (header) header.classList.toggle("is-scrolled", y > 24);
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        progress.style.transform =
          "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };
})();
