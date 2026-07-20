// ============================================================
// footer-main.js — Entry point e scheduler mezzanotte
// ============================================================

// Per testare una data specifica, decommentare la riga sotto:
// const TEST_DATE = new Date("2024-12-25T10:30:00");
let getNow = function () {
  if (typeof TEST_DATE !== "undefined") return TEST_DATE;
  return new Date();
};

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("Contatti");
  if (!footer) return;

  JsonData.load(AppConfig.footer.jsonKey)
    .then((data) => {
      configuraTimezone(data);
      getNow = getShopNow;

      footer.innerHTML = createFooterHTML(data, getNow());

      setTimeout(() => {
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }

        document.dispatchEvent(new CustomEvent("footerLoaded"));

        const now = getNow();
        const secondsToNextMinute = 60 - now.getSeconds();

        setTimeout(() => {
          aggiornaColoreOrari(data);
          setInterval(() => aggiornaColoreOrari(data), 60000);
        }, secondsToNextMinute * 1000);

        aggiornaColoreOrari(data);
        scheduleFooterRefreshAtMidnight(data);
      }, 100);
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del footer:", error);
      footer.innerHTML = `<p style="text-align:center; color: white;">Impossibile caricare le informazioni del footer.</p>`;
    });
});

function _ricostruisciFooter(data) {
  const footer = document.getElementById("Contatti");
  if (!footer || !data) return;

  footer.innerHTML = createFooterHTML(data, getNow());

  setTimeout(() => {
    if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
      currentMapCoordinates = null;
      initMap(data.mappa.latitudine, data.mappa.longitudine);
    }
    aggiornaColoreOrari(data);
  }, 100);
}

function scheduleFooterRefreshAtMidnight(data) {
  const now = getNow();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  console.log(
    `Prossimo aggiornamento footer schedulato tra ${Math.round(
      msUntilMidnight / 1000 / 60,
    )} minuti`,
  );

  setTimeout(() => {
    _ricostruisciFooter(data);
    setInterval(() => aggiornaColoreOrari(data), 60000);
    scheduleFooterRefreshAtMidnight(data);
  }, msUntilMidnight);
}
