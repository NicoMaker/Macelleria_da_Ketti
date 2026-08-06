// ============================================================
// footer-rebuild.js — Ricostruzione completa del footer
// Dipende da: footer-html-builder.js, footer-clock.js, map-embed.js
// ============================================================

function _ricostruisciFooter(data) {
  const footer = document.getElementById("Contatti");
  if (!footer || !data) return;

  footer.innerHTML = createFooterHTML(data, getNow());
  _annoFooterCostruzione = getNow().getUTCFullYear();

  setTimeout(() => {
    if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
      currentMapCoordinates = null;
      initMap(data.mappa.latitudine, data.mappa.longitudine);
    }
    aggiornaColoreOrari(data);
  }, 100);
}
