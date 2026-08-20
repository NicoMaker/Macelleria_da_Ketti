// ─────────────────────────────────────────────────────────────────────────────
// products-loader.js — Unico punto di fetch (home).
// Carica `JSON/progetti.json` e lo condivide tramite evento "prodottiCaricati".
// Dipende da: products-section-config.js (CONFIG globale)
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  JsonData.load(CONFIG.jsonKey)
    .then((data) => {
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
