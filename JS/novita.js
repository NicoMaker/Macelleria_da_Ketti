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
        "<p class='no-results'>Nessuna novità al momento.</p>";
    } else {
      novitaData.forEach((item) => {
        container.appendChild(createCard(item));
      });
    }
  }

  function createCard(item) {
    const card = document.createElement("div");
    card.className = "Progetti-card"; // Riutilizzo la classe delle card dei prodotti
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      if (item.link && item.link !== "#") {
        window.location.href = item.link;
      }
    });

    card.innerHTML = `  
      <div class="container-immagine">
        <img class="immagine" src="${item.immagine}" alt="${item.nome}" loading="lazy">
      </div>
      <div class="Progetti-card-content">
        <h3>${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
        <p class="prezzo">${item.prezzo}</p>
      </div>
    `;
    return card;
  }

  fetchData();
});