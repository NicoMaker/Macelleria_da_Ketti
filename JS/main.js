// ─────────────────────────────────────────────────────────────────────────────
// main.js — Unico punto di fetch. Carica il JSON e lo condivide con gli altri
//           moduli tramite l'evento custom "prodottiCaricati".
// ─────────────────────────────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAZIONE — modifica solo qui
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  jsonPath: "JSON/progetti.json",
  storageKeyCategory: "macelleriaSelectedCategory",
  storageKeySearch: "macelleriaSearchTerm",
  defaultFilter: "Tutti",
  scrollMargin: 20, // px extra sotto header + controls
};
// ════════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  fetch(CONFIG.jsonPath)
    .then((res) => res.json())
    .then((data) => {
      // Dispatcha un evento custom con i prodotti: novita.js e progetti.js
      // si mettono in ascolto su questo evento invece di fare fetch autonomi.
      document.dispatchEvent(
        new CustomEvent("prodottiCaricati", {
          detail: { prodotti: data.Prodotti },
        }),
      );
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei prodotti:", error);
      document.dispatchEvent(new CustomEvent("prodottiErrore"));
    });
});
