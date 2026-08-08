// ─────────────────────────────────────────────────────────────────────────────
// catalog-bootstrap.js — Entry point del catalogo prodotti
// Ascolta l'evento "prodottiCaricati" emesso da products-loader.js.
// Non fa nessun fetch diretto al JSON.
// Dipende da: tutti i file catalog-*.js precedenti
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  ProductsCatalog.progettiContainer = document.querySelector(
    ".progetti-container",
  );
  ProductsCatalog.filterContainer = document.querySelector(".filter-container");
  ProductsCatalog.searchInput = document.getElementById("search-progetti");

  if (!ProductsCatalog.progettiContainer) return;

  // Ascolta i dati provenienti da products-loader.js
  document.addEventListener("prodottiCaricati", (e) => {
    ProductsCatalog.allProducts = e.detail.prodotti;
    ProductsCatalog.populateFilters();
    ProductsCatalog.loadStateFromStorage();
    ProductsCatalog.applyFiltersAndSearch();
    ProductsCatalog.updateFilterButtons();

    if (window.location.hash === "#Prodotti") {
      const section = document.getElementById("Prodotti");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.addEventListener("prodottiErrore", () => {
    ProductsCatalog.progettiContainer.innerHTML =
      "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
  });

  // ── Listener ricerca ────────────────────────────────────────────────────────
  if (ProductsCatalog.searchInput) {
    ProductsCatalog.searchInput.addEventListener("input", () => {
      ProductsCatalog.currentSearchTerm = ProductsCatalog.searchInput.value;
      ProductsCatalog.saveStateToLocalStorage();
      ProductsCatalog.applyFiltersAndSearch();
      ProductsCatalog.scrollToProductGrid();
    });
  }

  // ── Listener navigazione (bfcache / ritorno da pagina prodotto) ─────────────
  window.addEventListener("pageshow", (event) => {
    console.log("Evento pageshow rilevato, persisted:", event.persisted);
    if (event.persisted) {
      ProductsCatalog.loadStateFromStorage();
      ProductsCatalog.applyFiltersAndSearch();
      ProductsCatalog.updateFilterButtons();
    }
  });

  window.addEventListener("focus", () => {
    console.log("Finestra tornata in focus");
    ProductsCatalog.loadStateFromStorage();
    if (ProductsCatalog.searchInput)
      ProductsCatalog.searchInput.value = ProductsCatalog.currentSearchTerm;
    ProductsCatalog.applyFiltersAndSearch();
    ProductsCatalog.updateFilterButtons();
  });
});
