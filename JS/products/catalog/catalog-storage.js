// ─────────────────────────────────────────────────────────────────────────────
// catalog-storage.js — Persistenza di filtro e ricerca nel localStorage
// Dipende da: catalog-state.js, products-section-config.js (CONFIG globale)
// ─────────────────────────────────────────────────────────────────────────────

ProductsCatalog.saveStateToLocalStorage = function () {
  try {
    localStorage.setItem(
      CONFIG.storageKeyCategory,
      ProductsCatalog.currentFilter,
    );
    localStorage.setItem(
      CONFIG.storageKeySearch,
      ProductsCatalog.currentSearchTerm,
    );
    console.log("Stato salvato:", {
      filtro: ProductsCatalog.currentFilter,
      ricerca: ProductsCatalog.currentSearchTerm,
    });
  } catch (e) {
    console.error("Impossibile salvare lo stato nel localStorage:", e);
  }
};

ProductsCatalog.loadStateFromStorage = function () {
  try {
    const storedCategory = localStorage.getItem(CONFIG.storageKeyCategory);
    const storedSearchTerm = localStorage.getItem(CONFIG.storageKeySearch);

    console.log("Stato caricato dal localStorage:", {
      filtro: storedCategory,
      ricerca: storedSearchTerm,
    });

    if (storedCategory && storedCategory !== "null")
      ProductsCatalog.currentFilter = storedCategory;

    if (storedSearchTerm && storedSearchTerm !== "null") {
      ProductsCatalog.currentSearchTerm = storedSearchTerm;
      if (ProductsCatalog.searchInput)
        ProductsCatalog.searchInput.value = storedSearchTerm;
    }
  } catch (e) {
    console.error("Impossibile caricare lo stato dal localStorage:", e);
  }
};
