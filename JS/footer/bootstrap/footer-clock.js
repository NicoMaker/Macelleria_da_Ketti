// ============================================================
// footer-clock.js — Orologio del negozio e giro di controllo al minuto
// Dipende da: schedule-live-updater.js, footer-rebuild.js
// ============================================================

// Per testare una data specifica, decommentare la riga sotto:
// const TEST_DATE = new Date("2024-12-25T10:30:00");
let getNow = function () {
  if (typeof TEST_DATE !== "undefined") return TEST_DATE;
  return new Date();
};

// Anno mostrato nel footer al momento della costruzione.
// Serve come guardia: se la scheda resta aperta oltre la mezzanotte del
// 1° gennaio e il setTimeout di mezzanotte non scatta (dispositivo sospeso,
// tab congelato dal browser), il giro al minuto se ne accorge e ricostruisce
// tutto il footer aggiornando anche l'anno del ©.
let _annoFooterCostruzione = null;

// Giro eseguito ogni minuto: aggiorna gli orari, ma se è cambiato l'anno
// ricostruisce l'intero footer.
function _giroAlMinuto(data) {
  const annoOra = getNow().getUTCFullYear();
  if (_annoFooterCostruzione !== null && annoOra !== _annoFooterCostruzione) {
    _annoFooterCostruzione = annoOra;
    _ricostruisciFooter(data);
  } else {
    aggiornaColoreOrari(data);
  }
}
