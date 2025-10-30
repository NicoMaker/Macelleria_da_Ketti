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
        loadStateFromStorage(); // Carica lo stato (filtro/ricerca) da localStorage
        applyFiltersAndSearch(); // Applica i filtri e la ricerca
        updateFilterButtons(); // Aggiorna lo stato visivo dei pulsanti dopo aver caricato lo stato
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

    // Assicurati che item.categorie sia un array, altrimenti usa un array vuoto
    const categories = item.categorie || [];
    let categoriaHtml = "";
    
    // Mostra la categoria solo se il filtro è "Tutti" e il prodotto ha effettivamente delle categorie
    if (currentFilter === "Tutti" && Array.isArray(categories) && categories.length > 0) {
      const prefix = categories.length > 1 ? "Categorie" : "Categoria";
      categoriaHtml = `<p class="descrizione categoria">${prefix}: ${categories.join(", ")}</p>`;
    }

    card.innerHTML = `
      <div class="container-immagine">
        <img class="immagine" src="${item.immagine}" alt="${item.nome}" loading="lazy">
      </div>
      <div class="Progetti-card-content">
        <h3>${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
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
  function loadStateFromStorage() {
    try {
      const storedCategory = localStorage.getItem("selectedCategory");
      const storedSearchTerm = localStorage.getItem("searchTerm");

      // Ottieni le categorie disponibili dai pulsanti di filtro
      const availableCategories = Array.from(
        document.querySelectorAll(".filter-button")
      ).map((btn) => btn.dataset.category);

      if (storedCategory) {
        // Controlla se la categoria salvata esiste ancora.
        // Se non esiste, imposta il filtro a "Tutti".
        currentFilter = availableCategories.includes(storedCategory) ? storedCategory : "Tutti";
      }
      if (storedSearchTerm) {
        currentSearchTerm = storedSearchTerm;
        searchInput.value = storedSearchTerm; // Imposta il valore dell'input di ricerca
      }
    } catch (e) {
      console.error("Impossibile caricare lo stato dal localStorage:", e);
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

  // Aggiungi un listener per l'evento 'pageshow' per gestire il ripristino dello stato
  // quando si torna indietro nella cronologia del browser.
  window.addEventListener('pageshow', function(event) {
    // 'persisted' è true se la pagina è stata caricata dalla cache del browser (bfcache)
    if (event.persisted) {
      loadStateFromStorage();
      applyFiltersAndSearch();
      updateFilterButtons(); // Aggiunto per aggiornare lo stato visivo dei pulsanti
    }
  });
});