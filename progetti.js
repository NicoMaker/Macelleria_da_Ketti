// Products loading and filtering
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".progetti-container")
  const filterButtons = document.querySelectorAll(".filter-button")

  let progettiData = []
  let filteredProjects = []
  let currentCategory = "all"
  let searchTerm = ""

  function updateLayout() {
    const width = window.innerWidth
    if (width <= 600) container.className = "progetti-container mobile-view"
    else if (width <= 900) container.className = "progetti-container tablet-view"
    else container.className = "progetti-container pc-view"
    updateDisplay()
  }

  function fetchData() {
    return fetch("progetti.json")
      .then((response) => response.json())
      .then((data) => {
        progettiData = data.Prodotti
        filterProjects()
      })
      .catch((error) => {
        console.error("Errore nel caricamento:", error)
        container.innerHTML = "<p class='no-results'>Errore nel caricamento dei prodotti.</p>"
      })
  }

  function updateFilter(category, shouldScroll = true) {
    currentCategory = category
    try {
      localStorage.setItem("selectedCategory", category)
    } catch (e) {}
    filterProjects()
    updateFilterStyle()

    if (shouldScroll && category !== "all") {
      const progettiSection = document.getElementById("Prodotti")
      if (progettiSection) {
        progettiSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  function filterProjects() {
    let tempFiltered =
      currentCategory === "all"
        ? progettiData
        : progettiData.filter((progetto) => progetto.categorie.includes(currentCategory))

    if (searchTerm) {
      tempFiltered = tempFiltered.filter((progetto) => {
        return (
          progetto.nome.toLowerCase().includes(searchTerm) ||
          progetto.categorie.some((cat) => cat.toLowerCase().includes(searchTerm))
        )
      })
    }

    filteredProjects = tempFiltered
    updateDisplay()
  }

  function updateFilterStyle() {
    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.category === currentCategory)
    })
  }

  function updateDisplay() {
    container.innerHTML = ""

    if (filteredProjects.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Nessun prodotto trovato. Prova a modificare i criteri di ricerca.</p>"
    } else {
      filteredProjects.forEach((project) => {
        container.appendChild(createCard(project))
      })
    }
  }

  function createCard(progetto) {
    const card = document.createElement("div")
    card.className = "Progetti-card"

    card.addEventListener("click", () => {
      window.location.href = progetto.link
    })

    card.style.cursor = "pointer"

    card.innerHTML = `  
      <div class="container-immagine">
        <img class="immagine" src="${progetto.immagine}" alt="${progetto.nome}" loading="lazy">
      </div>
      <div class="Progetti-card-content">
        <h3>${progetto.nome}</h3>
        <p class="descrizione">${progetto.descrizione}</p>
        <p class="prezzo">${progetto.prezzo}</p>
        <p class="categoria">${progetto.categorie.length > 1 ? "Categorie" : "Categoria"}: ${progetto.categorie.join(", ")}</p>
      </div>
    `
    return card
  }

  function addEventListeners() {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        updateFilter(button.dataset.category, true)
      })
    })

    // Search functionality
    const searchInput = document.getElementById("search-progetti")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value.toLowerCase().trim()
        filterProjects()
      })
    }

    window.addEventListener("resize", updateLayout)
  }

  function init() {
    let savedCategory = "all"
    try {
      const stored = localStorage.getItem("selectedCategory")
      if (stored && ["Bovino", "Suino", "Pollame", "all"].includes(stored)) {
        savedCategory = stored
      }
    } catch (e) {}

    const cameFromProjects = document.referrer.includes("/Projects/")

    fetchData().then(() => {
      updateFilter(savedCategory, false)

      if (cameFromProjects && savedCategory !== "all") {
        setTimeout(() => {
          const progettiSection = document.getElementById("Prodotti")
          if (progettiSection) {
            progettiSection.scrollIntoView({ behavior: "smooth" })
          }
        }, 500)
      }
    })

    addEventListeners()
    updateLayout()
  }

  init()
})
