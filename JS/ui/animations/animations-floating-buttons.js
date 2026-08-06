// ─────────────────────────────────────────────────────────────
// animations-floating-buttons.js — Pulsanti flottanti: WhatsApp, telefono, torna su
// Dipende da: animations-state.js
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  SiteAnimations.initFloatingButtons = function () {
    var PHONE = SiteAnimations.PHONE;
    var WA_TEXT = SiteAnimations.WA_TEXT;
    var reduceMotion = SiteAnimations.reduceMotion;

    // WhatsApp
    if (!document.querySelector(".quick-whatsapp")) {
      var wa = document.createElement("a");
      wa.className = "quick-whatsapp";
      wa.href =
        "https://wa.me/" +
        PHONE.replace(/[^0-9]/g, "") +
        "?text=" +
        encodeURIComponent(WA_TEXT);
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.setAttribute(
        "aria-label",
        "Scrivi alla Macelleria da Ketti su WhatsApp",
      );
      wa.innerHTML =
        '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C9.02 3 3.32 8.7 3.32 15.72c0 2.24.59 4.42 1.71 6.35L3.2 28.8l6.9-1.8a12.66 12.66 0 0 0 5.94 1.51h.01c7.01 0 12.72-5.7 12.72-12.72 0-3.4-1.32-6.6-3.72-9-2.4-2.4-5.6-3.79-9.01-3.79zm0 23.36h-.01c-1.9 0-3.76-.51-5.38-1.47l-.39-.23-4.1 1.07 1.1-3.99-.25-.41a10.53 10.53 0 0 1-1.62-5.61c0-5.83 4.75-10.57 10.58-10.57 2.83 0 5.48 1.1 7.48 3.1a10.5 10.5 0 0 1 3.1 7.48c0 5.83-4.75 10.63-10.51 10.63zm5.8-7.92c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37z"/></svg>';
      document.body.appendChild(wa);
    }
    // Telefono
    if (!document.querySelector(".quick-call")) {
      var call = document.createElement("a");
      call.className = "quick-call";
      call.href = "tel:" + PHONE;
      call.setAttribute("aria-label", "Chiama la Macelleria da Ketti");
      call.innerHTML =
        '<span class="material-icons" aria-hidden="true">call</span>';
      document.body.appendChild(call);
    }
    // Torna su
    if (!document.querySelector(".back-to-top")) {
      var btn = document.createElement("button");
      btn.className = "back-to-top";
      btn.setAttribute("aria-label", "Torna all'inizio della pagina");
      btn.innerHTML = "&#8593;";
      document.body.appendChild(btn);
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
      window.addEventListener(
        "scroll",
        function () {
          btn.classList.toggle("visible", window.scrollY > 600);
        },
        { passive: true },
      );
    }
  };
})();
