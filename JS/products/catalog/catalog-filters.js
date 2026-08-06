// ─────────────────────────────────────────────────────────────────────────────
// catalog-filters.js — Pulsanti filtro categoria
// Dipende da: catalog-state.js, category-colors.js, catalog-scroll.js,
//             catalog-storage.js, catalog-display.js
// ─────────────────────────────────────────────────────────────────────────────

ProductsCatalog.populateFilters = function () {
  if (!ProductsCatalog.filterContainer) return;

  const categories = new Set([CONFIG.defaultFilter]);
  ProductsCatalog.allProducts.forEach((p) =>
    p.categorie.forEach((c) => categories.add(c)),
  );

  ProductsCatalog.filterContainer.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("filter-button");
    button.textContent = category;
    button.dataset.category = category;
    CategoryColors.applyFilterButtonStyle(button, category, false);
    button.addEventListener("click", () => {
      ProductsCatalog.currentFilter = category;
      ProductsCatalog.saveStateToLocalStorage();
      ProductsCatalog.applyFiltersAndSearch();
      ProductsCatalog.updateFilterButtons();
      ProductsCatalog.scrollToProductGrid();
    });
    ProductsCatalog.filterContainer.appendChild(button);
  });
};

ProductsCatalog.updateFilterButtons = function () {
  document.querySelectorAll(".filter-button").forEach((btn) => {
    const isActive = btn.dataset.category === ProductsCatalog.currentFilter;
    btn.classList.toggle("active", isActive);
    CategoryColors.applyFilterButtonStyle(btn, btn.dataset.category, isActive);
  });
};
