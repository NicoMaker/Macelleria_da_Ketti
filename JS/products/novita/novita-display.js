// ─────────────────────────────────────────────────────────────────────────────
// novita-display.js — Renderizza l'elenco delle novità
// Dipende da: novita-card-builder.js
// ─────────────────────────────────────────────────────────────────────────────

NovitaSection.displayNovita = function (novitaData, container) {
  container.innerHTML = "";

  if (!novitaData || novitaData.length === 0) {
    container.innerHTML =
      "<p class='no-results'>Al momento non ci sono novità. Torna a trovarci presto! Nel frattempo esplora i nostri prodotti.</p>";
    return;
  }

  novitaData.forEach((item) =>
    container.appendChild(NovitaSection.createCard(item)),
  );
};
