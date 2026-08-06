// ─────────────────────────────────────────────────────────────────────────────
// novita-controller.js — Ascolta l'evento "prodottiCaricati" emesso da
// products-loader.js. Non fa nessun fetch diretto al JSON.
// Dipende da: novita-display.js
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".novita-container");
  if (!container) return;

  document.addEventListener("prodottiCaricati", (e) => {
    const novitaItems = e.detail.prodotti.filter((item) => item.isNovita);
    NovitaSection.displayNovita(novitaItems, container);
  });

  document.addEventListener("prodottiErrore", () => {
    container.innerHTML =
      "<p class='no-results'>Errore nel caricamento delle novità.</p>";
  });
});
