// Enhanced Progetti.js with search functionality and clickable cards for products
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".progetti-container"),
    filterButtons = document.querySelectorAll(".filter-button");

  let progettiData = [],
    filteredProjects = [],
    currentCategory = "all",
    searchTerm = "";

  // Create and add search input
  function createSearchInput() {
    const searchContainer = document.createElement("div");
    searchContainer.className = "search-container";

    searchContainer.innerHTML = `
      <div class="search-input-wrapper">
        <input type="text" id="search-progetti" placeholder="Cerca prodotti..." class="search-input">
        <span class="search-icon material-icons">search</span>
      </div>
    `;

    // Insert before filter container
    const filterContainer = document.querySelector(".filter-container");
    filterContainer.parentNode.insertBefore(searchContainer, filterContainer);

    // Add event listener for search input
    const searchInput = document.getElementById("search-progetti");
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      filterProjects();
    });
  }

  function updateLayout() {
    const width = window.innerWidth;
    if (width <= 600) container.className = "progetti-container mobile-view";
    else if (width <= 900)
      container.className = "progetti-container tablet-view";
    else container.className = "progetti-container pc-view";
    updateDisplay();
  }

  function fetchData() {
    return fetch("Projects/Progetti.json") // Uniformato il nome del file e reso asincrono
      .then((response) => response.json())
      .then((data) => {
        progettiData = data.Prodotti; // Changed from Progetti to Prodotti
        createSearchInput(); // Create search input after data is loaded
        // L'applicazione del filtro iniziale verrà gestita dalla funzione init
      })
      .catch((error) => {
        console.error("Errore nel caricamento:", error);
        container.innerHTML = "<p>Errore nel caricamento dei prodotti.</p>";
        throw error; // Propaga l'errore per essere gestito da init
      });
  }

  function updateFilter(category, shouldScroll = true) {
    currentCategory = category;
    // Salva la categoria selezionata in localStorage
    try {
      localStorage.setItem("selectedCategory", category);
    } catch (e) {}
    filterProjects();
    updateFilterStyle();
    // Scroll automatico alla sezione Progetti se richiesto
    if (shouldScroll && category !== "all") {
      const progettiSection = document.getElementById("Prodotti");
      if (progettiSection) {
        progettiSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  function filterProjects() {
    // First filter by category
    let tempFiltered =
      currentCategory === "all"
        ? progettiData
        : progettiData.filter((progetto) =>
            progetto.categorie.includes(currentCategory),
          );

    // Then filter by search term if it exists
    if (searchTerm) {
      tempFiltered = tempFiltered.filter((progetto) => {
        return (
          progetto.nome.toLowerCase().includes(searchTerm) ||
          progetto.categorie.some((cat) =>
            cat.toLowerCase().includes(searchTerm),
          )
        );
      });
    }

    filteredProjects = tempFiltered;
    updateDisplay();
  }

  function updateFilterStyle() {
    filterButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.category === currentCategory,
      );
    });
  }

  function updateDisplay() {
    container.innerHTML = "";

    if (filteredProjects.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Nessun prodotto trovato. Prova a modificare i criteri di ricerca.</p>";
    } else {
      filteredProjects.forEach((project) => {
        container.appendChild(createCard(project));
      });
    }
  }

  function createCard(progetto) {
    const card = document.createElement("div");
    card.className = "Progetti-card";

    // Make the entire card clickable
    card.addEventListener("click", () => {
      window.location.href = progetto.link;
    });

    // Add cursor style to indicate clickability
    card.style.cursor = "pointer";

    card.innerHTML = `  
      <div class="container-immagine">
        <img class="immagine" src="${progetto.immagine}" alt="${progetto.nome}">
      </div>
      <h3>${progetto.nome}</h3>
      <p class="descrizione">${progetto.descrizione}</p>
      <p class="prezzo">${progetto.prezzo}</p>
      <p class="categoria">${
        progetto.categorie.length > 1 ? "Categorie" : "Categoria"
      }: ${progetto.categorie.join(", ")}</p>
    `;
    return card;
  }

  function addEventListeners() {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        updateFilter(button.dataset.category, true);
      });
    });

    // Add responsive layout updates on window resize
    window.addEventListener("resize", updateLayout);
  }

  function init() {
    // Recupera la categoria selezionata da localStorage, se presente
    let savedCategory = "all";
    try {
      const stored = localStorage.getItem("selectedCategory");
      if (
        stored &&
        ["Bovino", "Suino", "Pollame", "all"].includes(stored)
      ) {
        savedCategory = stored;
      }
    } catch (e) {}

    // Controlla se l'utente proviene da una pagina interna sotto /Projects/
    const cameFromProjects = document.referrer.includes("/Projects/");

    // Ridefinisci fetchData per gestire il comportamento condizionale
    fetchData = (function (originalFetchData) {
      return function () {
        fetch("Projects/Progetti.json")
          .then((response) => response.json())
          .then((data) => {
            progettiData = data.Prodotti;
            createSearchInput();

            // Applica il filtro salvato ma NON scrolla subito
            updateFilter(savedCategory, false);

            // Scrolla solo se l'utente proviene da /Projects/*
            if (cameFromProjects && savedCategory !== "all") {
              setTimeout(() => {
                const progettiSection = document.getElementById("Prodotti");
                if (progettiSection) {
                  progettiSection.scrollIntoView({ behavior: "smooth" });
                }
              }, 500);
            }
          })
          .catch((error) => {
            console.error("Errore nel caricamento:", error);
            container.innerHTML = "<p>Errore nel caricamento dei prodotti.</p>";
          });
      };
    })(fetchData);

    fetchData();
    addEventListeners();
    updateLayout();
  }

  init();
});

function init() {
  let savedCategory = "all";
  try {
    const stored = localStorage.getItem("selectedCategory");
    if (stored && ["Bovino", "Suino", "Pollame"].includes(stored)) {
      savedCategory = stored;
    }
  } catch (e) {}

  const cameFromProjects = document.referrer.includes("/Projects/");
  allowScrollOnLoad = cameFromProjects;

  // Blocca scroll automatico su #Prodotti se arrivo da Home
  if (!cameFromProjects) {
    history.replaceState(null, "", window.location.pathname); // Rimuove eventuale #Prodotti
    window.scrollTo({ top: 0 }); // Forza lo scroll in cima
  }

  fetch("Projects/Progetti.json")
    .then((response) => response.json())
    .then((data) => {
      progettiData = data.Prodotti;
      createSearchInput();

      // ✅ Applica sempre il filtro salvato (anche se NON scrolliamo)
      updateFilter(savedCategory, cameFromProjects);
    })
    .catch((error) => {
      console.error("Errore nel caricamento:", error);
      container.innerHTML = "<p>Errore nel caricamento dei prodotti.</p>";
    });

  addEventListeners();
  updateLayout();
}
