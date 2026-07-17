// ─────────────────────────────────────────────────────────────
// modern-animations.js — Macelleria da Ketti
// Motore animazioni in stile "Da Prat Falegnameria":
// • Reveal allo scroll (anche su card generate dal JS del sito)
// • Header che si compatta + barra di progresso lettura
// • Hero con entrata orchestrata e zoom cinematografico
// • Pulsanti flottanti: WhatsApp, telefono, torna su
// • Separatori artigianali tra le sezioni
// Testi, colori e font del sito restano invariati.
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  var PHONE = "+393357802124"; // da JSON/footer.json
  var WA_TEXT = "Buongiorno! Vorrei informazioni sui vostri prodotti.";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ── 1. Hero ──
  function initHero() {
    if (!document.querySelector(".hero-section")) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add("hero-loaded");
      });
    });
  }

  // ── 2. Header + barra di progresso ──
  function initHeader() {
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
  }

  // ── 3. Pulsanti flottanti ──
  function initFloatingButtons() {
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
      wa.setAttribute("aria-label", "Scrivi alla Macelleria da Ketti su WhatsApp");
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
        { passive: true }
      );
    }
  }

  // ── 4. Reveal allo scroll ──
  var observer = null;
  function getObserver() {
    if (observer) return observer;
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    return observer;
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

    // Titoli e sottotitoli
    root
      .querySelectorAll(".section-title, .section-subtitle")
      .forEach(function (el) {
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
    root.querySelectorAll(".features-grid .feature-card").forEach(
      function (el, i) {
        markReveal(el, "up", i);
      }
    );

    // Card prodotti e novità (generate dal JS del sito) con stagger
    root
      .querySelectorAll(".novita-container, .progetti-container")
      .forEach(function (grid) {
        Array.prototype.forEach.call(grid.children, function (card, i) {
          markReveal(card, "up", i);
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

  // Contenuti generati dinamicamente (card, footer…)
  function watchDynamicContent() {
    var mo = new MutationObserver(function (mutations) {
      var added = false;
      mutations.forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) added = true;
      });
      if (added) scanForTargets(document);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("prodottiCaricati", function () {
      setTimeout(function () {
        scanForTargets(document);
      }, 50);
    });
  }

  // ── 5. Separatori artigianali tra le sezioni della home ──
  function initSectionDividers() {
    var sections = document.querySelectorAll(
      "section.about-section, section.products-section"
    );
    sections.forEach(function (sec) {
      if (
        sec.previousElementSibling &&
        sec.previousElementSibling.classList.contains("section-divider")
      )
        return;
      var div = document.createElement("div");
      div.className = "section-divider";
      div.setAttribute("aria-hidden", "true");
      div.innerHTML = "<span></span>";
      sec.parentNode.insertBefore(div, sec);
    });
  }

  // ── Avvio ──
  function init() {
    initHeader();
    initFloatingButtons();
    initSectionDividers();

    if (reduceMotion || !("IntersectionObserver" in window)) {
      document.body.classList.add("hero-loaded");
      return;
    }

    initHero();
    scanForTargets(document);
    watchDynamicContent();

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
