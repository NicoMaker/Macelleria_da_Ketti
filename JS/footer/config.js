// ============================================================
// footer-main.js — Entry point e scheduler mezzanotte
// Dipende da: tutti gli altri file footer-*.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("Contatti");
  if (!footer) return;

  const jsonPath = window.location.pathname.includes("/Projects/")
    ? "../JSON/footer.json"
    : "JSON/footer.json";

  fetch(jsonPath)
    .then((response) => response.json())
    .then((data) => {
      footer.innerHTML = createFooterHTML(data);

      setTimeout(() => {
        // Inizializza la mappa solo se necessario
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }

        document.dispatchEvent(new CustomEvent("footerLoaded"));

        const now = new Date();
        const secondsToNextMinute = 60 - now.getSeconds();

        setTimeout(() => {
          aggiornaColoreOrari(data);
          setInterval(() => aggiornaColoreOrari(data), 60000);
        }, secondsToNextMinute * 1000);

        aggiornaColoreOrari(data);

        // Schedula il refresh intelligente a mezzanotte
        scheduleFooterRefreshAtMidnight(data);
      }, 100);
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del footer:", error);
      footer.innerHTML = `<p style="text-align:center; color: white;">Impossibile caricare le informazioni del footer.</p>`;
    });
});

function scheduleFooterRefreshAtMidnight(data) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  console.log(
    `Prossimo aggiornamento footer schedulato tra ${Math.round(
      msUntilMidnight / 1000 / 60,
    )} minuti`,
  );

  setTimeout(() => {
    // Usa la data reale al momento dell'esecuzione
    const footer = document.getElementById("Contatti");
    if (footer && data) {
      // Passa come giorno di partenza il nuovo giorno reale
      footer.innerHTML = createFooterHTML(data, new Date());

      setTimeout(() => {
        // Inizializza la mappa SOLO se le coordinate sono cambiate
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }

        aggiornaColoreOrari(data);
        setInterval(() => aggiornaColoreOrari(data), 60000);

        // Riprogramma il refresh per la prossima mezzanotte
        scheduleFooterRefreshAtMidnight(data);
      }, 100);
    }
  }, msUntilMidnight);
}
