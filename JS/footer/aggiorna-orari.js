// ============================================================
// aggiorna-orari.js — Aggiornamento live della lista orari
// ============================================================

let _countdownInterval = null;
let _stagionePrecedente = null;

function _avviaCountdownStagione(dataCambio, nomeAttiva, nomeProssima) {
  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }

  const wrapper = document.getElementById("countdown-content-wrapper");
  const testoSpan = document.getElementById("countdown-testo");
  const labelAtt = document.getElementById("countdown-label-attiva");
  const labelPross = document.getElementById("countdown-label-prossima");

  if (!testoSpan || !wrapper) return;

  wrapper.style.visibility = "visible";

  if (labelAtt) {
    labelAtt.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#00FF7F;display:inline-block;flex-shrink:0;"></span> ${nomeAttiva.toUpperCase()}`;
  }
  if (labelPross) {
    labelPross.textContent = `${nomeProssima.toUpperCase()} →`;
  }

  const _tick = () => {
    const diff = dataCambio.getTime() - getNow().getTime();

    if (diff <= 0) {
      const el = document.getElementById("countdown-stagione");
      if (el) el.remove();
      clearInterval(_countdownInterval);
      _countdownInterval = null;
      return;
    }

    const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
    const ore = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((diff % (1000 * 60)) / 1000);

    const parti = [];
    if (giorni > 0) parti.push(`${giorni}g`);
    parti.push(`${String(ore).padStart(2, "0")}h`);
    parti.push(`${String(min).padStart(2, "0")}m`);
    parti.push(`${String(sec).padStart(2, "0")}s`);

    testoSpan.textContent = parti.join("  ");
  };

  _tick();
  _countdownInterval = setInterval(_tick, 1000);
}

function _fermaCountdownStagione() {
  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }
  const el = document.getElementById("countdown-stagione");
  if (el) el.remove();
}

function _getDataCambio(transizione, dataRiferimento) {
  if (!transizione) return null;
  const oggi = new Date(dataRiferimento || getNow());
  oggi.setUTCHours(0, 0, 0, 0);
  const anno = oggi.getUTCFullYear();

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);
    const candidata = new Date(
      transizione.a === "Estivo" ? date.inizioEstivo : date.inizioInvernale,
    );
    candidata.setUTCHours(0, 0, 0, 0);
    if (candidata >= oggi) return candidata;
  }
  return null;
}

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

function aggiornaColoreOrari(data) {
  // Salva i dati per usarli in _aggiornaOraUtente
  window._footerData = data;

  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  const oggiReal = getNow();
  const oggi = new Date(oggiReal);
  oggi.setUTCHours(0, 0, 0, 0);
  const giornoSettimana = oggiReal.getUTCDay();
  const oraCorrente = oggiReal.getUTCHours() * 100 + oggiReal.getUTCMinutes();
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

  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getUTCFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(
    data,
    oggi.getUTCFullYear() + 1,
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
    d.setUTCDate(oggi.getUTCDate() + i);
    d.setUTCHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(d);
  }

  const lista = document.querySelector("#orari-footer");
  if (!lista) return;

  lista.innerHTML = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";

      const dayOfWeek = dataDelGiorno.getUTCDay();
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