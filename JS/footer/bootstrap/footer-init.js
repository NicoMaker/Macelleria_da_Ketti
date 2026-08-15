// ============================================================
// footer-init.js — Entry point del footer (carica dati, costruisce HTML,
// avvia mappa, orari live e scheduler di mezzanotte)
// Dipende da: TUTTI i file precedenti di JS/footer/
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("Contatti");
  if (!footer) return;

  JsonData.load(AppConfig.footer.jsonKey)
    .then((data) => {
      configuraTimezone(data);
      getNow = getShopNow;

      footer.innerHTML = createFooterHTML(data, getNow());
      _annoFooterCostruzione = getNow().getFullYear();

      setTimeout(() => {
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }

        document.dispatchEvent(new CustomEvent("footerLoaded"));

        const now = getNow();
        const secondsToNextMinute = 60 - now.getSeconds();

        setTimeout(() => {
          aggiornaColoreOrari(data);
          setInterval(() => _giroAlMinuto(data), 60000);
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
