// ─────────────────────────────────────────────────────────────────────────────
// catalog-state.js — Stato condiviso del catalogo prodotti
// Dipende da: products-section-config.js (CONFIG globale)
// ─────────────────────────────────────────────────────────────────────────────

const ProductsCatalog = {
  progettiContainer: null,
  filterContainer: null,
  searchInput: null,
  allProducts: [],
  currentFilter: CONFIG.defaultFilter,
  currentSearchTerm: "",
};
