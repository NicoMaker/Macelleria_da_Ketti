// ─────────────────────────────────────────────────────────────────────────────
// product-page.js — Carica automaticamente le categorie dal JSON
// per qualsiasi pagina prodotto. Nessuno script inline necessario.
// Dipende da: category-colors.js
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const badgesEl = document.getElementById("product-category-badges");
  if (!badgesEl) return;

  // Rileva il path del JSON (dalla radice o da una sottocartella Projects/)
  const isInSubfolder = window.location.pathname.includes("/Projects/");
  const jsonPath = isInSubfolder ? "../JSON/progetti.json" : "JSON/progetti.json";

  // Ricava il nome del file HTML corrente (es. "prodotto-cotoletta.html")
  const currentFile = window.location.pathname.split("/").pop();

  fetch(jsonPath)
    .then((res) => res.json())
    .then((data) => {
      // Cerca il prodotto il cui link termina con il file corrente
      const prodotto = (data.Prodotti || []).find((p) => {
        if (!p.link || p.link === "#") return false;
        return p.link.split("/").pop() === currentFile;
      });

      if (prodotto && prodotto.categorie && prodotto.categorie.length > 0) {
        badgesEl.innerHTML = CategoryColors.getBadgesHTML(prodotto.categorie);
      } else {
        // Nasconde il contenitore se non trovato
        badgesEl.style.display = "none";
      }
    })
    .catch((err) => {
      console.warn("product-page.js: impossibile caricare le categorie.", err);
      badgesEl.style.display = "none";
    });
});