// ============================================================
// schedule-live-updater.js — Aggiornamento live della lista orari
// Dipende da: season-countdown-timer.js, user-local-time-display.js,
//             season-calculator.js, closure-lookup.js,
//             opening-status-checker.js, time-format-utils.js
// ============================================================

let _stagionePrecedente = null;

function aggiornaColoreOrari(data) {
  // Salva i dati per usarli in _aggiornaOraUtente
  window._footerData = data;

  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  const oggiReal = getNow();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);
  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();
  const indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  configuraCambioStagione(data);

  const { orari: orariAttivi, nomeStagione } = getOrariAttiviOggi(
    data,
    oggiReal,
  );

  if (_stagionePrecedente !== null && _stagionePrecedente !== nomeStagione) {
    _stagionePrecedente = nomeStagione;
    if (typeof _ricostruisciFooter === "function") {
      _ricostruisciFooter(data);
    }
    return;
  }
  _stagionePrecedente = nomeStagione;

  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(
    data,
    oggi.getFullYear() + 1,
  );

  const dataOggiFormattata = formatDateDM(oggiReal);
  const orariExtraOggi = getOrariExtraForDate(
    data,
    dataOggiFormattata,
    giornoSettimana,
  );

  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates,
    unifiedFerieDatesNextYear,
  );
  const isFestivita =
    singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra =
    singleDayClosure && singleDayClosure.reason === "motivi-extra";

  let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;
  const orariDaUsareOggi = orariExtraOggi || orariAttivi[indiceGiornoCorrente];
  if (orariExtraOggi) eChiusoOggi = false;

  const statoApertura = checkStatoApertura(
    orariDaUsareOggi,
    oraCorrente,
    eChiusoOggi,
    orariExtraOggi,
    data.minutiInChiusura,
  );

  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    d.setHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(d);
  }

  const lista = document.querySelector("#orari-footer");
  if (!lista) return;

  lista.innerHTML = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";

      const dayOfWeek = dataDelGiorno.getDay();
      const orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const dataFmt = formatDateDM(dataDelGiorno);
      const nomeGiorno = data.nomiGiorni[dayOfWeek];
      const orariExtraGiorno = getOrariExtraForDate(data, dataFmt, dayOfWeek);
      const { orari: orariGiorno } = getOrariAttiviOggi(data, dataDelGiorno);

      let testoOrario;
      if (orariExtraGiorno) {
        testoOrario = orariExtraGiorno;
      } else {
        testoOrario = orariGiorno[orariIndex];
        const closureCheck = getSingleDayClosureReason(
          dataDelGiorno,
          data,
          unifiedFerieDates,
          unifiedFerieDatesNextYear,
        );
        if (closureCheck && closureCheck.reason === "festivita") {
          testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
        } else if (closureCheck && closureCheck.reason === "ferie") {
          const motivo = closureCheck.motivoSpecifico || "Ferie";
          testoOrario = `${nomeGiorno}: Chiuso (${motivo}) fino al ${closureCheck.dataChiusura}`;
        } else if (closureCheck && closureCheck.reason === "motivi-extra") {
          testoOrario = `${nomeGiorno}: Chiuso (${closureCheck.motivoSpecifico})`;
        }
      }

      // Offset calcolato per la data di QUESTO giorno → gestisce i cambi di
      // ora legale che possono cadere tra oggi e un giorno futuro.
      const diffHoursGiorno = -getTimezoneOffsetHoursForDate(dataDelGiorno);
      if (
        Math.abs(diffHoursGiorno) > 0.01 &&
        !testoOrario.toLowerCase().includes("chiuso")
      ) {
        const orarioConvertito = convertOrarioString(
          testoOrario,
          diffHoursGiorno,
          dataDelGiorno,
          data.nomiGiorni,
        );
        testoOrario = formattaOrarioConFuso(testoOrario, orarioConvertito);
      }

      if (i === 0) {
        peso = "font-weight:bold;";
        if (eChiusoOggi || statoApertura.stato === "chiuso") {
          colore = legenda.colori.chiuso || "orange";
        } else if (statoApertura.stato === "in-apertura") {
          colore = legenda.colori["in apertura"] || "#87CEEB";
          const minuti = statoApertura.minutiAllaApertura;
          testoOrario += ` (${minuti} ${minuti === 1 ? "minuto" : "minuti"})`;
        } else if (statoApertura.stato === "in-chiusura") {
          colore = legenda.colori["in chiusura"] || "#FFD700";
          const minuti = statoApertura.minutiAllaChiusura;
          testoOrario += ` (${minuti} ${minuti === 1 ? "minuto" : "minuti"})`;
        } else {
          colore = legenda.colori.aperto || "#00FF7F";
        }
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${testoOrario}</li>`;
    })
    .join("");

  const titoloEl = document.getElementById("titolo-orari");
  if (titoloEl) {
    const transizione = getRilevaTransizioneStagione(data, oggiReal);
    if (transizione && !transizione.eCambioOggi) {
      titoloEl.innerHTML = `Orario <span style="font-weight:900;">${transizione.da}</span><span style="font-weight:400;opacity:0.6;">/${transizione.a}</span>`;
    } else {
      titoloEl.textContent = nomeStagione ? `Orario ${nomeStagione}` : "Orario";
    }
  }

  const transizione = getRilevaTransizioneStagione(data, oggiReal);
  if (transizione && !transizione.eCambioOggi) {
    const dataCambio = _getDataCambio(transizione, oggiReal);
    if (dataCambio)
      _avviaCountdownStagione(dataCambio, transizione.da, transizione.a);
  } else {
    _fermaCountdownStagione();
  }

  const testoInAperturaSpan = document.getElementById("testo-in-apertura");
  if (testoInAperturaSpan) {
    if (statoApertura.stato === "in-apertura") {
      const minuti = statoApertura.minutiAllaApertura;
      testoInAperturaSpan.textContent = `In apertura tra ${minuti} ${minuti === 1 ? "minuto" : "minuti"}`;
    } else {
      testoInAperturaSpan.textContent =
        legenda.testo["in apertura"] || "In apertura";
    }
  }

  const testoInChiusuraSpan = document.getElementById("testo-in-chiusura");
  if (testoInChiusuraSpan) {
    if (statoApertura.stato === "in-chiusura") {
      const minuti = statoApertura.minutiAllaChiusura;
      testoInChiusuraSpan.textContent = `In chiusura tra ${minuti} ${minuti === 1 ? "minuto" : "minuti"}`;
    } else {
      testoInChiusuraSpan.textContent =
        legenda.testo["in chiusura"] || "In chiusura";
    }
  }

  const descEl = document.getElementById("descrizione-stagione");
  if (descEl) {
    const stagioni = data.orariStagionali || [];
    const stagioneAttivaResult = getStagioneAttivaConDate(data, oggiReal);
    const stagioneAttiva = stagioneAttivaResult
      ? stagioneAttivaResult.stagione
      : null;
    const valide = stagioni.filter((s) => s.nome && s.orari);

    if (!valide.length) {
      descEl.style.display = "none";
    } else {
      const attive = valide.filter(
        (s) => stagioneAttiva && s.nome === stagioneAttiva.nome,
      );
      const nonAttive = valide.filter(
        (s) => !stagioneAttiva || s.nome !== stagioneAttiva.nome,
      );

      const _riga = (s, isAttiva) => {
        let annoInizio, annoFine;
        if (isAttiva && stagioneAttivaResult) {
          annoInizio = stagioneAttivaResult.annoInizio;
          annoFine = stagioneAttivaResult.annoFine;
        } else {
          const prossima = _getProssimaIstanzaStagione(s, oggiReal);
          annoInizio = prossima.annoInizio;
          annoFine = prossima.annoFine;
        }
        const testo = _testoStagioneConAnni(s, annoInizio, annoFine);
        return `<div style="${isAttiva ? "font-weight:bold;" : "opacity:0.65;"}">${testo}</div>`;
      };

      descEl.style.marginTop = "14px";
      descEl.innerHTML = [
        ...attive.map((s) => _riga(s, true)),
        ...nonAttive.map((s) => _riga(s, false)),
      ].join("");
      descEl.style.display = "";
    }
  }

  _aggiornaOraUtente();
}
