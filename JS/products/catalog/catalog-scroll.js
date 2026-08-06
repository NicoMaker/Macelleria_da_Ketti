// ─────────────────────────────────────────────────────────────────────────────
// catalog-scroll.js — Scroll verso la griglia prodotti
// Dipende da: products-section-config.js (CONFIG globale)
// ─────────────────────────────────────────────────────────────────────────────

ProductsCatalog.scrollToProductGrid = function () {
  const grid = document.querySelector(".progetti-container");
  if (!grid) return;

  const header = document.querySelector(".site-header");
  const controls = document.getElementById("product-controls-sticky");
  const totalOffset =
    (header ? header.offsetHeight : 0) +
    (controls ? controls.offsetHeight : 0) +
    CONFIG.scrollMargin;

  const offsetPosition =
    grid.getBoundingClientRect().top + window.pageYOffset - totalOffset;
  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
};
