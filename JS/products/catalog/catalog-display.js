// ─────────────────────────────────────────────────────────────────────────────
// catalog-display.js — Applica filtro/ricerca e renderizza le card prodotto
// Dipende da: catalog-state.js, catalog-filters.js, catalog-storage.js,
//             category-colors.js
// ─────────────────────────────────────────────────────────────────────────────

ProductsCatalog.applyFiltersAndSearch = function () {
  let filtered = ProductsCatalog.allProducts;

  if (ProductsCatalog.currentFilter !== CONFIG.defaultFilter) {
    filtered = filtered.filter((p) =>
      p.categorie.includes(ProductsCatalog.currentFilter),
    );
  }

  if (ProductsCatalog.currentSearchTerm) {
    const term = ProductsCatalog.currentSearchTerm.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.descrizione.toLowerCase().includes(term) ||
        p.categorie.some((c) => c.toLowerCase().includes(term)),
    );
  }

  ProductsCatalog.displayProducts(filtered);
  ProductsCatalog.updateFilterButtons();
};

ProductsCatalog.displayProducts = function (products) {
  const progettiContainer = ProductsCatalog.progettiContainer;
  progettiContainer.innerHTML = "";

  if (products.length === 0) {
    progettiContainer.innerHTML =
      "<p class='no-results'>Nessun prodotto trovato con i criteri selezionati.</p>";
    return;
  }

  products.forEach((p) =>
    progettiContainer.appendChild(ProductsCatalog.createProductCard(p)),
  );
};

ProductsCatalog.createProductCard = function (item) {
  const card = document.createElement("div");
  card.className = "Progetti-card";
  card.addEventListener("click", () => {
    ProductsCatalog.saveStateToLocalStorage();
    if (item.link && item.link !== "#") window.location.href = item.link;
  });

  const categories = item.categorie || [];
  let categoriaHtml = "";

  // Mostra i badge solo quando il filtro è "Tutti" —
  // se è già selezionata una categoria specifica è ridondante mostrarla.
  if (categories.length > 0 && ProductsCatalog.currentFilter === CONFIG.defaultFilter) {
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
};
