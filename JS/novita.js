// ─────────────────────────────────────────────────────────────────────────────
// novita.js — Ascolta l'evento "prodottiCaricati" emesso da main.js.
//             Non fa nessun fetch diretto al JSON.
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".novita-container");
  if (!container) return;

  // Ascolta i dati provenienti da main.js
  document.addEventListener("prodottiCaricati", (e) => {
    const novitaItems = e.detail.prodotti.filter((item) => item.isNovita);
    displayNovita(novitaItems);
  });

  document.addEventListener("prodottiErrore", () => {
    container.innerHTML =
      "<p class='no-results'>Errore nel caricamento delle novità.</p>";
  });

  // ── Funzioni ────────────────────────────────────────────────────────────────

  function displayNovita(novitaData) {
    container.innerHTML = "";

    if (!novitaData || novitaData.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Al momento non ci sono novità. Torna a trovarci presto! Nel frattempo esplora i nostri prodotti.</p>";
      return;
    }

    novitaData.forEach((item) => container.appendChild(createCard(item)));
  }

  function createCard(item) {
    const card = document.createElement("div");
    card.className = "Progetti-card novita-card";
    card.addEventListener("click", () => {
      if (item.link && item.link !== "#") window.location.href = item.link;
    });

    const categoriaHtml = item.categorie && item.categorie.length > 0
      ? CategoryColors.getBadgesHTML(item.categorie)
      : "";

    card.innerHTML = `
      <div class="container-immagine">
        <span class="novita-badge">Novità</span>
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
});