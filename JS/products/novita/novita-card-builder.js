// ─────────────────────────────────────────────────────────────────────────────
// novita-card-builder.js — Crea la card HTML di una singola novità
// Dipende da: category-colors.js
// ─────────────────────────────────────────────────────────────────────────────

const NovitaSection = {};

NovitaSection.createCard = function (item) {
  const card = document.createElement("div");
  card.className = "Progetti-card novita-card";
  card.addEventListener("click", () => {
    if (item.link && item.link !== "#") window.location.href = item.link;
  });

  const categoriaHtml =
    item.categorie && item.categorie.length > 0
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
};
