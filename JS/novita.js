// Novita loading
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".novita-container");
  if (!container) return;

  function fetchData() {
    // Ora fetchiamo dal file unificato dei prodotti
    fetch("JSON/progetti.json")
      .then((response) => response.json())
      .then((data) => {
        // Filtriamo i prodotti che hanno isNovita = true
        const novitaItems = data.Prodotti.filter(item => item.isNovita);
        displayNovita(novitaItems);
      })
      .catch((error) => {
        console.error("Errore nel caricamento delle novità:", error);
        container.innerHTML =
          "<p class='no-results'>Errore nel caricamento delle novità.</p>";
      });
  }

  function displayNovita(novitaData) {
    container.innerHTML = "";

    if (!novitaData || novitaData.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Al momento non ci sono novità. Torna a trovarci presto! nel frattempo esplore i nostri prodotti</p>";
    } else {
      novitaData.forEach((item) => {
        container.appendChild(createCard(item));
      });
    }
  }

  function createCard(item) {
    const card = document.createElement("div");
    // Aggiungo classi specifiche per le novità
    card.className = "Progetti-card novita-card";
    card.addEventListener("click", () => {
      if (item.link && item.link !== "#") {
        window.location.href = item.link;
      }
    });

    // Mostra la categoria se disponibile
    const categoriaHtml =
      item.categorie && item.categorie.length > 0
        ? `<p class="categoria">${item.categorie.length > 1 ? "Categorie" : "Categoria"}: ${item.categorie.join(", ")}</p>`
        : "";

    card.innerHTML = `  
      <div class="container-immagine">
        <span class="novita-badge">Novità</span>
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

  fetchData();
});