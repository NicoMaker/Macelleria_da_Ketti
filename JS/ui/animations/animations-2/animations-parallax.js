// ─────────────────────────────────────────────────────────────
// animations-parallax.js — Parallasse allo scroll (hero e sezione storia)
// Dipende da: animations-state.js
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  SiteAnimations.initParallax = function () {
    var hero = document.querySelector(".hero-image");
    var aboutImgs = document.querySelectorAll(".about-image img");
    if (!hero && !aboutImgs.length) return;

    var ticking = false;
    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (hero) {
        // la hero scorre più lenta del resto (max ±60px, coperto dal 120% di altezza)
        var shift = Math.min(y * 0.18, 60);
        hero.style.setProperty("--par", shift.toFixed(1) + "px");
      }
      aboutImgs.forEach(function (img) {
        var r = img.getBoundingClientRect();
        var center = r.top + r.height / 2 - window.innerHeight / 2;
        var shift = Math.max(-24, Math.min(24, -center * 0.05));
        img.style.setProperty("--par", shift.toFixed(1) + "px");
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  };
})();
