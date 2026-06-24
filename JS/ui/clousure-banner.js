// closure-banner.js - Gestisce il banner delle chiusure nella hero section
// Mostra automaticamente le chiusure imminenti o attive

(function () {
  // Attendi che sia disponibile JsonData
  function waitForJsonData(callback) {
    if (typeof JsonData !== "undefined" && JsonData.load) {
      callback();
    } else {
      setTimeout(function () {
        waitForJsonData(callback);
      }, 100);
    }
  }

  waitForJsonData(function () {
    document.addEventListener("DOMContentLoaded", function () {
      const bannerContainer = document.getElementById("hero-closure-banner");
      const bannerText = document.getElementById("hero-closure-text");

      if (!bannerContainer || !bannerText) {
        console.warn("Elementi banner non trovati");
        return;
      }

      console.log("🔍 Caricamento chiusure per banner...");

      // Carica i dati del footer per ottenere le chiusure
      JsonData.load(AppConfig.footer.jsonKey)
        .then(function (data) {
          console.log("✅ Dati footer caricati:", data);

          const today = new Date();
          const currentYear = today.getFullYear();
          const chiusure = data.chiusure || [];

          console.log("📅 Chiusure trovate:", chiusure.length);

          // Trova la chiusura attiva o imminente
          let activeClosure = null;
          let upcomingClosure = null;
          let minDays = Infinity;

          for (let i = 0; i < chiusure.length; i++) {
            const chiusura = chiusure[i];
            if (!chiusura) continue;

            if (
              chiusura.tipo === "periodo" &&
              chiusura.inizio &&
              chiusura.fine
            ) {
              const inizioParts = chiusura.inizio.split("/").map(Number);
              const fineParts = chiusura.fine.split("/").map(Number);
              const inizioDay = inizioParts[0];
              const inizioMonth = inizioParts[1];
              const fineDay = fineParts[0];
              const fineMonth = fineParts[1];

              // Crea date
              let dataInizio = new Date(
                currentYear,
                inizioMonth - 1,
                inizioDay,
              );
              let dataFine = new Date(currentYear, fineMonth - 1, fineDay);

              // Gestisci periodo a cavallo d'anno (es. 24/12 - 06/01)
              if (dataInizio > dataFine) {
                dataFine = new Date(currentYear + 1, fineMonth - 1, fineDay);
              }

              // Resetta le ore per confronto corretto
              const oggiTimestamp = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
              ).getTime();
              const inizioTimestamp = new Date(
                dataInizio.getFullYear(),
                dataInizio.getMonth(),
                dataInizio.getDate(),
              ).getTime();
              const fineTimestamp = new Date(
                dataFine.getFullYear(),
                dataFine.getMonth(),
                dataFine.getDate(),
              ).getTime();

              const motivo =
                chiusura.motivo && chiusura.motivo.trim()
                  ? chiusura.motivo
                  : "Ferie";

              console.log(
                `📌 Verifico: ${chiusura.inizio}-${chiusura.fine} (${motivo})`,
              );
              console.log(
                `   Oggi: ${oggiTimestamp}, Inizio: ${inizioTimestamp}, Fine: ${fineTimestamp}`,
              );

              // Se siamo dentro il periodo di chiusura
              if (
                oggiTimestamp >= inizioTimestamp &&
                oggiTimestamp <= fineTimestamp
              ) {
                activeClosure = {
                  tipo: "attiva",
                  inizio: chiusura.inizio,
                  fine: chiusura.fine,
                  motivo: motivo,
                };
                console.log("🔴 TROVATA CHIUSURA ATTIVA!");
                break;
              }

              // Se mancano meno di 14 giorni all'inizio
              if (oggiTimestamp < inizioTimestamp) {
                const diffDays = Math.ceil(
                  (inizioTimestamp - oggiTimestamp) / (1000 * 60 * 60 * 24),
                );
                console.log(`   Inizio tra ${diffDays} giorni`);
                if (diffDays <= 14 && diffDays < minDays) {
                  minDays = diffDays;
                  upcomingClosure = {
                    tipo: "imminente",
                    inizio: chiusura.inizio,
                    fine: chiusura.fine,
                    giorni: diffDays,
                    motivo: motivo,
                  };
                }
              }
            }
          }

          // Mostra il banner
          if (activeClosure) {
            const motivoText =
              activeClosure.motivo !== "Ferie"
                ? ` - ${activeClosure.motivo}`
                : "";
            bannerText.innerHTML = `CHIUSO PER FERIE dal ${activeClosure.inizio} al ${activeClosure.fine}${motivoText}`;
            bannerContainer.style.display = "block";
            console.log("✅ Banner CHIUSURA ATTIVA mostrato");
          } else if (upcomingClosure) {
            const tipoChiusura =
              upcomingClosure.motivo === "Ferie"
                ? "ferie"
                : upcomingClosure.motivo;
            bannerText.innerHTML = `⚠️ ATTENZIONE: Chiusura per ${tipoChiusura} dal ${upcomingClosure.inizio} al ${upcomingClosure.fine} (tra ${upcomingClosure.giorni} giorni) ⚠️`;
            bannerContainer.style.display = "block";
            console.log("✅ Banner CHIUSURA IMMINENTE mostrato");
          } else {
            bannerContainer.style.display = "none";
            console.log("ℹ️ Nessuna chiusura attiva o imminente");
          }
        })
        .catch(function (err) {
          console.error("❌ Errore nel caricamento chiusure:", err);
        });
    });
  });
})();
