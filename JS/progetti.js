document.addEventListener("DOMContentLoaded", () => {
  const progettiContainer = document.querySelector(".progetti-container");
  const filterContainer = document.querySelector(".filter-container");
  const searchInput = document.getElementById("search-progetti");

  let allProducts = [];
  let currentFilter = "Tutti"; // Filtro predefinito
  let currentSearchTerm = ""; // Termine di ricerca predefinito

  // Funzione per recuperare i prodotti e inizializzare la sezione
  function initProgetti() {
    fetch("JSON/progetti.json")
      .then((response) => response.json())
      .then((data) => {
        allProducts = data.Prodotti;
        populateFilters();
        loadStateFromLocalStorage(); // Carica lo stato (filtro/ricerca) da localStorage
        applyFiltersAndSearch(); // Applica i filtri e la ricerca

        // Se l'URL ha l'hash #Prodotti, scorri alla sezione
        if (window.location.hash === "#Prodotti") {
          scrollToProductsSection();
        }
      })
      .catch((error) => {
        console.error("Errore nel caricamento dei prodotti:", error);
        progettiContainer.innerHTML =
          "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
      });
  }

  // Funzione per popolare i pulsanti di filtro
  function populateFilters() {
    const categories = new Set(["Tutti"]); // Inizia con 'Tutti'
    allProducts.forEach((product) => {
      product.categorie.forEach((cat) => categories.add(cat));
    });

    filterContainer.innerHTML = ""; // Pulisci i pulsanti esistenti
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.classList.add("filter-button");
      button.textContent = category;
      button.dataset.category = category;
      button.addEventListener("click", () => {
        currentFilter = category;
        saveStateToLocalStorage(); // Salva il filtro in localStorage
        applyFiltersAndSearch();
        updateFilterButtons(); // Aggiorna lo stato attivo dei pulsanti
      });
      filterContainer.appendChild(button);
    });
    updateFilterButtons(); // Imposta lo stato attivo iniziale
  }

  // Funzione per aggiornare lo stato attivo dei pulsanti di filtro
  function updateFilterButtons() {
    document.querySelectorAll(".filter-button").forEach((button) => {
      if (button.dataset.category === currentFilter) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  // Funzione per applicare filtri e ricerca
  function applyFiltersAndSearch() {
    let filteredProducts = allProducts;

    // Applica il filtro per categoria
    if (currentFilter !== "Tutti") {
      filteredProducts = filteredProducts.filter((product) =>
        product.categorie.includes(currentFilter)
      );
    }

    // Applica il filtro per termine di ricerca
    if (currentSearchTerm) {
      const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.descrizione.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.categorie.some((cat) =>
            cat.toLowerCase().includes(lowerCaseSearchTerm)
          )
      );
    }

    displayProducts(filteredProducts);
  }

  // Funzione per visualizzare i prodotti
  function displayProducts(products) {
    progettiContainer.innerHTML = ""; // Pulisci i prodotti esistenti

    if (products.length === 0) {
      progettiContainer.innerHTML =
        "<p class='no-results'>Nessun prodotto trovato con i criteri selezionati.</p>";
      return;
    }

    products.forEach((product) => {
      const card = createProductCard(product);
      progettiContainer.appendChild(card);
    });
  }

  // Funzione per creare una singola card prodotto
  function createProductCard(item) {
    const card = document.createElement("div");
    card.className = "Progetti-card";
    card.addEventListener("click", () => {
      if (item.link && item.link !== "#") {
        window.location.href = item.link;
      }
    });

    const categoriaHtml =
      item.categorie && item.categorie.length > 0
        ? `<p class="categoria">${item.categorie.join(", ")}</p>`
        : "";

    card.innerHTML = `
      <div class="container-immagine">
        <img class="immagine" src="${item.immagine}" alt="${item.nome}" loading="lazy">
      </div>
      <div class="Progetti-card-content">
        <h3>${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
        <p class="prezzo">${item.prezzo}</p>
        ${categoriaHtml}
      </div>
    `;
    return card;
  }

  // Funzione per salvare il filtro corrente e il termine di ricerca in localStorage
  function saveStateToLocalStorage() {
    try {
      localStorage.setItem("selectedCategory", currentFilter);
      localStorage.setItem("searchTerm", currentSearchTerm);
    } catch (e) {
      console.error("Impossibile salvare lo stato nel localStorage:", e);
    }
  }

  // Funzione per caricare il filtro e il termine di ricerca da localStorage
  function loadStateFromLocalStorage() {
    try {
      const storedCategory = localStorage.getItem("selectedCategory");
      const storedSearchTerm = localStorage.getItem("searchTerm");

      if (storedCategory) {
        currentFilter = storedCategory;
      }
      if (storedSearchTerm) {
        currentSearchTerm = storedSearchTerm;
        searchInput.value = storedSearchTerm; // Imposta il valore dell'input di ricerca
      }
    } catch (e) {
      console.error("Impossibile caricare lo stato dal localStorage:", e);
    }
  }

  // Funzione per scorrere alla sezione prodotti
  function scrollToProductsSection() {
    const productsSection = document.getElementById("Prodotti");
    if (productsSection) {
      // Scorrimento fluido all'inizio della sezione
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Listener per l'input di ricerca
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      saveStateToLocalStorage(); // Salva il termine di ricerca in localStorage
      applyFiltersAndSearch();
    });
  }

  // Inizializza la sezione prodotti
  initProgetti();
});