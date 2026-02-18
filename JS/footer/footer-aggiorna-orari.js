// ============================================================
// footer-aggiorna-orari.js — Aggiornamento live della lista orari
// Dipende da: footer-date-utils.js, footer-chiusure.js, footer-apertura.js
// ============================================================

function aggiornaColoreOrari(data) {
  const orari = data.orari || [];
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  if (!orari.length) return;

  // USA SEMPRE LA DATA REALE DEL MOMENTO
  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);
  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();

  const indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(data, oggi.getFullYear() + 1);

  const dataOggiFormattata = formatDateDM(oggiReal);
  const orariExtraOggi = getOrariExtraForDate(data, dataOggiFormattata, giornoSettimana);

  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates,
    unifiedFerieDatesNextYear
  );
  const isFestivita = singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra = singleDayClosure && singleDayClosure.reason === "motivi-extra";

  let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

  const orariDaUsareOggi = orariExtraOggi || orari[indiceGiornoCorrente];

  if (orariExtraOggi) {
    eChiusoOggi = false;
  }

  const statoApertura = checkStatoApertura(
    orariDaUsareOggi,
    oraCorrente,
    eChiusoOggi,
    orariExtraOggi,
    data.minutiInChiusura
  );

  // Genera i prossimi 7 giorni partendo da OGGI (data reale)
  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const dataDelGiorno = new Date(oggi);
    dataDelGiorno.setDate(oggi.getDate() + i);
    dataDelGiorno.setHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(dataDelGiorno);
  }

  const lista = document.querySelector("#orari-footer");
  if (!lista) return;

  lista.innerHTML = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";
      let testoExtra = "";

      const dayOfWeek = dataDelGiorno.getDay();
      const orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const dataFormattata = formatDateDM(dataDelGiorno);
      const orariExtraGiorno = getOrariExtraForDate(data, dataFormattata, dayOfWeek);

      let testoOrario;
      const nomeGiorno = data.nomiGiorni[dayOfWeek];

      if (orariExtraGiorno) {
        testoOrario = orariExtraGiorno;
      } else {
        testoOrario = orari[orariIndex];
        const closureCheck = getSingleDayClosureReason(
          dataDelGiorno,
          data,
          unifiedFerieDates,
          unifiedFerieDatesNextYear
        );
        if (closureCheck && closureCheck.reason === "festivita") {
          testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
        } else if (closureCheck && closureCheck.reason === "ferie") {
          testoOrario = `${nomeGiorno}: Chiuso (Ferie fino al ${closureCheck.dataChiusura})`;
        } else if (closureCheck && closureCheck.reason === "motivi-extra") {
          testoOrario = `${nomeGiorno}: Chiuso (${closureCheck.motivoSpecifico})`;
        }
      }

      if (i === 0) {
        peso = "font-weight:bold;";

        if (eChiusoOggi || statoApertura.stato === "chiuso") {
          colore = legenda.colori.chiuso || "orange";
        } else if (statoApertura.stato === "in-chiusura") {
          colore = legenda.colori["in chiusura"] || "#FFD700";
          const minuti = statoApertura.minutiAllaChiusura;
          const testoMinuti = minuti === 1 ? "minuto" : "minuti";
          testoOrario = `${testoOrario} (${minuti} ${testoMinuti})`;
          testoExtra = "";
        } else {
          colore = legenda.colori.aperto || "#00FF7F";
        }
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${testoOrario}${testoExtra}</li>`;
    })
    .join("");

  const testoInChiusuraSpan = document.getElementById("testo-in-chiusura");
  if (testoInChiusuraSpan) {
    if (statoApertura.stato === "in-chiusura") {
      const minuti = statoApertura.minutiAllaChiusura;
      const testoMinuti = minuti === 1 ? "minuto" : "minuti";
      testoInChiusuraSpan.textContent = `In chiusura tra ${minuti} ${testoMinuti}`;
    } else {
      testoInChiusuraSpan.textContent = legenda.testo["in chiusura"] || "In chiusura";
    }
  }
}
