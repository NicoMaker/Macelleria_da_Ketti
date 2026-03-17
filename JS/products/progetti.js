// ─────────────────────────────────────────────────────────────────────────────
// progetti.js — Ascolta l'evento "prodottiCaricati" emesso da products-loader.js.
// Non fa nessun fetch diretto al JSON.
// Dipende da: products-section-config.js (CONFIG globale), category-colors.js
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const progettiContainer = document.querySelector(".progetti-container");
  const filterContainer = document.querySelector(".filter-container");
  const searchInput = document.getElementById("search-progetti");

  if (!progettiContainer) return;

  let allProducts = [];
  let currentFilter = CONFIG.defaultFilter;
  let currentSearchTerm = "";

  // Ascolta i dati provenienti da products-loader.js
  document.addEventListener("prodottiCaricati", (e) => {
    allProducts = e.detail.prodotti;
    populateFilters();
    loadStateFromStorage();
    applyFiltersAndSearch();
    updateFilterButtons();

    if (window.location.hash === "#Prodotti") {
      const section = document.getElementById("Prodotti");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.addEventListener("prodottiErrore", () => {
    progettiContainer.innerHTML =
      "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
  });

  // ── Filtri ──────────────────────────────────────────────────────────────────

  function populateFilters() {
    if (!filterContainer) return;

    const categories = new Set([CONFIG.defaultFilter]);
    allProducts.forEach((p) => p.categorie.forEach((c) => categories.add(c)));

    filterContainer.innerHTML = "";
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.classList.add("filter-button");
      button.textContent = category;
      button.dataset.category = category;
      CategoryColors.applyFilterButtonStyle(button, category, false);
      button.addEventListener("click", () => {
        currentFilter = category;
        saveStateToLocalStorage();
        applyFiltersAndSearch();
        updateFilterButtons();
        scrollToProductGrid();
      });
      filterContainer.appendChild(button);
    });
  }

  function updateFilterButtons() {
    document.querySelectorAll(".filter-button").forEach((btn) => {
      const isActive = btn.dataset.category === currentFilter;
      btn.classList.toggle("active", isActive);
      CategoryColors.applyFilterButtonStyle(btn, btn.dataset.category, isActive);
    });
  }

  function scrollToProductGrid() {
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
  }

  // ── Ricerca e visualizzazione ───────────────────────────────────────────────

  function applyFiltersAndSearch() {
    let filtered = allProducts;

    if (currentFilter !== CONFIG.defaultFilter) {
      filtered = filtered.filter((p) => p.categorie.includes(currentFilter));
    }

    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.descrizione.toLowerCase().includes(term) ||
          p.categorie.some((c) => c.toLowerCase().includes(term)),
      );
    }

    displayProducts(filtered);
    updateFilterButtons();
  }

  function displayProducts(products) {
    progettiContainer.innerHTML = "";

    if (products.length === 0) {
      progettiContainer.innerHTML =
        "<p class='no-results'>Nessun prodotto trovato con i criteri selezionati.</p>";
      return;
    }

    products.forEach((p) => progettiContainer.appendChild(createProductCard(p)));
  }

  function createProductCard(item) {
    const card = document.createElement("div");
    card.className = "Progetti-card";
    card.addEventListener("click", () => {
      saveStateToLocalStorage();
      if (item.link && item.link !== "#") window.location.href = item.link;
    });

    const categories = item.categorie || [];
    let categoriaHtml = "";

    // Mostra i badge solo quando il filtro è "Tutti" —
    // se è già selezionata una categoria specifica è ridondante mostrarla.
    if (categories.length > 0 && currentFilter === CONFIG.defaultFilter) {
      categoriaHtml = CategoryColors.getBadgesHTML(categories);
    }

    card.innerHTML = `
      <div class="container-immagine">
        <img class="immagine" src="${item.immagine}" alt="${item.nome}" loading="lazy">
      </div>
      <div class="Progetti-card-content">
        <h3 class="nome">${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
        ${categoriaHtml}
      </div>
    `;
    return card;
  }

  // ── Stato (localStorage) ────────────────────────────────────────────────────

  function saveStateToLocalStorage() {
    try {
      localStorage.setItem(CONFIG.storageKeyCategory, currentFilter);
      localStorage.setItem(CONFIG.storageKeySearch, currentSearchTerm);
      console.log("Stato salvato:", {
        filtro: currentFilter,
        ricerca: currentSearchTerm,
      });
    } catch (e) {
      console.error("Impossibile salvare lo stato nel localStorage:", e);
    }
  }

  function loadStateFromStorage() {
    try {
      const storedCategory = localStorage.getItem(CONFIG.storageKeyCategory);
      const storedSearchTerm = localStorage.getItem(CONFIG.storageKeySearch);

      console.log("Stato caricato dal localStorage:", {
        filtro: storedCategory,
        ricerca: storedSearchTerm,
      });

      if (storedCategory && storedCategory !== "null") currentFilter = storedCategory;

      if (storedSearchTerm && storedSearchTerm !== "null") {
        currentSearchTerm = storedSearchTerm;
        if (searchInput) searchInput.value = storedSearchTerm;
      }
    } catch (e) {
      console.error("Impossibile caricare lo stato dal localStorage:", e);
    }
  }

  // ── Listener ricerca ────────────────────────────────────────────────────────

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      saveStateToLocalStorage();
      applyFiltersAndSearch();
      scrollToProductGrid();
    });
  }

  // ── Listener navigazione (bfcache / ritorno da pagina prodotto) ─────────────

  window.addEventListener("pageshow", (event) => {
    console.log("Evento pageshow rilevato, persisted:", event.persisted);
    if (event.persisted) {
      loadStateFromStorage();
      applyFiltersAndSearch();
      updateFilterButtons();
    }
  });

  window.addEventListener("focus", () => {
    console.log("Finestra tornata in focus");
    loadStateFromStorage();
    if (searchInput) searchInput.value = currentSearchTerm;
    applyFiltersAndSearch();
    updateFilterButtons();
  });
});

