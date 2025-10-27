// Products loading and filtering
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".progetti-container");
  const filterButtons = document.querySelectorAll(".filter-button");
  const filterContainer = document.querySelector(".filter-container");
  let progettiData = [];
  let filteredProjects = [];
  let currentCategory = "all";
  let searchTerm = "";

  function updateLayout() {
    const width = window.innerWidth;
    if (width <= 600) container.className = "progetti-container mobile-view";
    else if (width <= 900)
      container.className = "progetti-container tablet-view";
    else container.className = "progetti-container pc-view";
    updateDisplay();
  }

  function fetchData() {
    return fetch("JSON/progetti.json")
      .then((response) => response.json())
      .then((data) => {
        progettiData = data.Prodotti;
        generateFilterButtons();
        filterProjects();
      })
      .catch((error) => {
        console.error("Errore nel caricamento:", error);
        container.innerHTML =
          "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
      });
  }

  function generateFilterButtons() {
    if (!filterContainer) return;

    // Estrai tutte le categorie uniche dai prodotti
    const categories = [...new Set(progettiData.flatMap(p => p.categorie || []))];
    
    // Crea il pulsante "Tutti"
    let buttonsHTML = `<button class="filter-button active" data-category="all">Tutti</button>`;

    // Crea un pulsante per ogni categoria
    categories.forEach(category => {
      buttonsHTML += `<button class="filter-button" data-category="${category}">${category}</button>`;
    });

    filterContainer.innerHTML = buttonsHTML;

    // Aggiungi gli event listener ai nuovi pulsanti
    filterContainer.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', () => updateFilter(button.dataset.category, true));
    });
  }

  function updateFilter(category, shouldScroll = true) {
    currentCategory = category;
    try {
      localStorage.setItem("selectedCategory", category);
    } catch (e) {}
    filterProjects();
    updateFilterStyle();

    if (shouldScroll && category !== "all") {
      const progettiSection = document.getElementById("Prodotti");
      if (progettiSection) {
        progettiSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  function filterProjects() {
    let tempFiltered =
      currentCategory === "all"
        ? progettiData
        : progettiData.filter((progetto) =>
            progetto.categorie && progetto.categorie.includes(currentCategory)
          );

    if (searchTerm) {
      tempFiltered = tempFiltered.filter((progetto) => {
        return (
          (progetto.nome && progetto.nome.toLowerCase().includes(searchTerm)) ||
          (progetto.categorie && progetto.categorie.some((cat) =>
            cat.toLowerCase().includes(searchTerm))
          )
        );
      });
    }

    filteredProjects = tempFiltered;
    updateDisplay();
  }

  function updateFilterStyle() {
    document.querySelectorAll('.filter-container .filter-button').forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.category === currentCategory
      );
    });
  }

  function updateDisplay() {
    container.innerHTML = "";

    if (filteredProjects.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Nessun prodotto trovato. Torneranno presto disponibili!</p>";
    } else {
      filteredProjects.forEach((project) => {
        container.appendChild(createCard(project));
      });
    }
  }

  function createCard(progetto) {
    const card = document.createElement("div");
    card.className = "Progetti-card";

    // Rendi la card cliccabile solo se esiste un link
    if (progetto.link && progetto.link !== "#") {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        window.location.href = progetto.link;
      });
    }

    // Mostra la categoria solo se il filtro è "Tutti" e la categoria è disponibile
    const categoriaHtml =
      currentCategory === "all" && progetto.categorie && progetto.categorie.length > 0
        ? `<p class="categoria">${progetto.categorie.length > 1 ? "Categorie" : "Categoria"}: ${progetto.categorie.join(", ")}</p>`
        : "";

    card.innerHTML = `  
      <div class="container-immagine">
        <img class="immagine" src="${progetto.immagine}" alt="${progetto.nome}" loading="lazy">
      </div>
      <div class="Progetti-card-content">
        <h3>${progetto.nome}</h3>
        <p class="descrizione">${progetto.descrizione}</p>
        ${categoriaHtml}
      </div>
    `;
    return card;
  }

  function addEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-progetti");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value.toLowerCase().trim();
        filterProjects();
      });
    }

    window.addEventListener("resize", updateLayout);
  }

  function init() {
    let savedCategory = "all";
    try {
      // Non è più necessario validare le categorie qui, dato che vengono generate dinamicamente
      const stored = localStorage.getItem("selectedCategory");
      if (stored) {
        savedCategory = stored;
      }

    } catch (e) {}

    const cameFromProjects = document.referrer.includes("/Projects/");

    fetchData().then(() => {
      updateFilter(savedCategory, false);

      if (cameFromProjects && savedCategory !== "all") {
        setTimeout(() => {
          const progettiSection = document.getElementById("Prodotti");
          if (progettiSection) {
            progettiSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 500);
      }
    });

    addEventListeners();
    updateLayout();
  }

  init();
});
