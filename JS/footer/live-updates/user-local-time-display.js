// ============================================================
// user-local-time-display.js — Aggiorna l'ora locale dell'utente nel footer
// Dipende da: timezone-utils.js, time-format-utils.js
// ============================================================

function _aggiornaOraUtente() {
  const el = document.getElementById("user-local-time-display");
  if (!el) return;
  const now = getUserNow();
  const str =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");
  el.textContent = str;

  const offsetContainer = el.closest(".user-local-time");
  if (offsetContainer) {
    const offsetSpan = offsetContainer.querySelector("span:last-child");
    if (offsetSpan) {
      const offsetHours = getTimezoneOffsetHours();
      // Usa la funzione di formattazione
      const info = window._footerData ? window._footerData.info : {};
      const shopName = info.titolo || "Macelleria da Ketti";
      const offsetText = formatTimezoneOffsetText(offsetHours, shopName);
      offsetSpan.textContent = offsetText;
    }
  }
}
