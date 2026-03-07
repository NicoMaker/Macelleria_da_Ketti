// ============================================================
// creazione_html.js — Costruzione HTML del footer
// Dipende da: date-utils.js, Gestisci_chiusure.js, gestisci_apertura.js
// Le date di cambio stagione sono gestite in date-utils.js
// ============================================================

// ── HTML stagioni: attiva PRIMA (grassetto), le altre dopo (opache) ──
function getAllStagioniHTML(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length)
    return `<div id="descrizione-stagione" style="display:none;"></div>`;

  const ref = dataRiferimento || new Date();
  const stagioneAttivaResult = getStagioneAttivaConDate(data, ref);
  const stagioneAttiva = stagioneAttivaResult
    ? stagioneAttivaResult.stagione
    : null;

  const valide = stagioni.filter((s) => s.nome && s.orari);
  const attive    = valide.filter((s) => stagioneAttiva && s.nome === stagioneAttiva.nome);
  const nonAttive = valide.filter((s) => !stagioneAttiva || s.nome !== stagioneAttiva.nome);

  const _riga = (s, isAttiva) => {
    let annoInizio, annoFine;
    if (isAttiva && stagioneAttivaResult) {
      annoInizio = stagioneAttivaResult.annoInizio;
      annoFine   = stagioneAttivaResult.annoFine;
    } else {
      const prossima = _getProssimaIstanzaStagione(s, ref);
      annoInizio = prossima.annoInizio;
      annoFine   = prossima.annoFine;
    }
    const testo = _testoStagioneConAnni(s, annoInizio, annoFine);
    return `<div style="${isAttiva ? "font-weight:bold;" : "opacity:0.65;"}">${testo}</div>`;
  };

  const righe = [
    ...attive.map((s) => _riga(s, true)),
    ...nonAttive.map((s) => _riga(s, false)),
  ].join("");

  return `<div id="descrizione-stagione" style="margin-top:14px;font-size:0.85em;">${righe}</div>`;
}

// ── Blocco countdown + intestazione stagioni ─────────────────
// Mostrato solo quando il cambio è nella settimana (non oggi).
// Layout:
//
//   ┌─────────────────────────────────────────┐
//   │  ● INVERNALE          ESTIVO →          │
//   │      2g  13h  30m  00s                  │
//   └─────────────────────────────────────────┘
//
// Il div è già nel DOM; aggiorna-orari.js aggiorna solo #countdown-testo.
function _getCountdownHTML(transizione) {
  // Blocco sempre presente nel DOM (display:none quando non serve)
  const display = (transizione && !transizione.eCambioOggi) ? "" : "display:none;";

  let stagioneAttivaLabel = "";
  let stagioneProssimaLabel = "";
  let preview = "";

  if (transizione && !transizione.eCambioOggi) {
    stagioneAttivaLabel  = transizione.da.toUpperCase();
    stagioneProssimaLabel = transizione.a.toUpperCase();
    const g = transizione.giorniMancanti;
    preview = g === 1 ? "1g" : `${g}g`;
  }

  return `
  <div id="countdown-stagione" style="${display}margin-bottom:10px;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);">

    <!-- Riga stagioni: attiva ● a sinistra, prossima → a destra -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:0.78em;letter-spacing:0.08em;font-weight:600;">
      <span id="countdown-label-attiva" style="display:flex;align-items:center;gap:5px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#00FF7F;display:inline-block;flex-shrink:0;"></span>
        ${stagioneAttivaLabel}
      </span>
      <span id="countdown-label-prossima" style="opacity:0.6;">
        ${stagioneProssimaLabel} →
      </span>
    </div>

    <!-- Label cambio stagione -->
    <div style="font-size:0.72em;letter-spacing:0.1em;text-transform:uppercase;opacity:0.55;text-align:left;margin-bottom:4px;padding-left:13px;">Cambio stagione tra</div>

    <!-- Countdown grande -->
    <div style="font-size:1.45em;font-weight:700;letter-spacing:0.04em;line-height:1;text-align:left;padding-left:13px;">
      <span id="countdown-testo">${preview}</span>
    </div>

  </div>`;
}

// ── Titolo orari ─────────────────────────────────────────────
// Se c'è un cambio imminente (non oggi): "Orario Invernale/Estivo"
// Altrimenti: "Orario <StagioneAttiva>"
function _calcolaTitoloOrari(transizione, nomeStagione) {
  if (transizione && !transizione.eCambioOggi) {
    return `Orario <span style="font-weight:900;">${transizione.da}</span><span style="font-weight:400;opacity:0.6;">/${transizione.a}</span>`;
  }
  if (nomeStagione) return `Orario ${nomeStagione}`;
  return "Orario";
}

function createFooterHTML(data, giornoPartenza) {
  const oggiReal = giornoPartenza || new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);

  const giornoSettimana     = oggiReal.getDay();
  const oraCorrente         = oggiReal.getHours() * 100 + oggiReal.getMinutes();
  const indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  const info     = data.info     || {};
  const contatti = data.contatti || {};
  const social   = data.social   || {};
  const legenda  = data.legendaOrari || { colori: {}, testo: {} };

  configuraCambioStagione(data);

  const { orari, nomeStagione } = getOrariAttiviOggi(data, oggiReal);
  const transizione   = getRilevaTransizioneStagione(data, oggiReal);
  const titoloOrari   = _calcolaTitoloOrari(transizione, nomeStagione);
  const countdownHTML = _getCountdownHTML(transizione);
  const stagioniHTML  = getAllStagioniHTML(data, oggiReal);

  const unifiedFerieDates        = getUnifiedFerieDates(data, oggi.getFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(data, oggi.getFullYear() + 1);

  const dataOggiFormattata = formatDateDM(oggiReal);
  const orariExtraOggi     = getOrariExtraForDate(data, dataOggiFormattata, giornoSettimana);

  const singleDayClosure = getSingleDayClosureReason(
    oggiReal, data, unifiedFerieDates, unifiedFerieDatesNextYear
  );
  const isFestivita   = singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi    = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra = singleDayClosure && singleDayClosure.reason === "motivi-extra";

  let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;
  const orariDaUsareOggi = orariExtraOggi || orari[indiceGiornoCorrente];
  if (orariExtraOggi) eChiusoOggi = false;

  const statoApertura = checkStatoApertura(
    orariDaUsareOggi, oraCorrente, eChiusoOggi, orariExtraOggi, data.minutiInChiusura
  );

  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    giorniDaVisualizzare.push(d);
  }

  const orariHtml = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso   = "";

      const dayOfWeek  = dataDelGiorno.getDay();
      const orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const dataFmt    = formatDateDM(dataDelGiorno);
      const nomeGiorno = data.nomiGiorni[dayOfWeek];
      const orariExtraGiorno = getOrariExtraForDate(data, dataFmt, dayOfWeek);
      const { orari: orariGiorno } = getOrariAttiviOggi(data, dataDelGiorno);

      let testoOrario;
      if (orariExtraGiorno) {
        testoOrario = orariExtraGiorno;
      } else {
        testoOrario = orariGiorno[orariIndex];
        const closureCheck = getSingleDayClosureReason(
          dataDelGiorno, data, unifiedFerieDates, unifiedFerieDatesNextYear
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

      if (i === 0) {
        peso = "font-weight:bold;";
        if (eChiusoOggi || statoApertura.stato === "chiuso") {
          colore = legenda.colori.chiuso || "orange";
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

  const testoInChiusuraSpan =
    statoApertura.stato === "in-chiusura"
      ? `In chiusura tra ${statoApertura.minutiAllaChiusura} ${
          statoApertura.minutiAllaChiusura === 1 ? "minuto" : "minuti"
        }`
      : legenda.testo["in chiusura"] || "In chiusura";

  return `
    <div class="footer-content">
      <div class="footer-grid">

        <!-- Tradizione e qualità + Contatti -->
        <div class="footer-section footer-section-tradizione-contatti">
          <h3 class="footer-title">${info.titolo || ""}</h3>
          <p class="footer-text">${info.testo || ""}</p>

          <h4 class="footer-subtitle">Contatti</h4>
          <ul class="footer-list">
            ${contatti.telefono
              ? `<li class="footer-item"><span class="material-icons">phone</span> <a href="tel:${contatti.telefono.replace(/\s/g, "")}">${formatPhoneNumber(contatti.telefono)}</a></li>`
              : ""}
            ${contatti.email
              ? `<li class="footer-item"><span class="material-icons">email</span> <a href="mailto:${contatti.email}">${contatti.email}</a></li>`
              : ""}
            ${contatti.indirizzo
              ? `<li class="footer-item"><span class="material-icons">location_on</span> <a href="${contatti.indirizzo}" target="_blank">${contatti.indirizzo_visuale}</a></li>`
              : ""}
          </ul>
        </div>

        <!-- Orari -->
        <div class="footer-section">
          ${countdownHTML}
          <br>
          <h4 id="titolo-orari" class="footer-subtitle" style="margin-top:14px;">${titoloOrari}</h4>
          <ul id="orari-footer" class="footer-list">${orariHtml}</ul>
        </div>

        <!-- Social + Legenda -->
        <div class="footer-section">
          <h4 class="footer-subtitle">Seguici</h4>
          <div class="social-links">
            ${social.facebook
              ? `<a href="${social.facebook}" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" style="width:24px;height:24px;"></a>`
              : ""}
            ${social.instagram
              ? `<a href="${social.instagram}" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" style="width:24px;height:24px;"></a>`
              : ""}
            ${social.whatsapp
              ? `<a href="${social.whatsapp}" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png" style="width:24px;height:24px;"></a>`
              : ""}
          </div>
          <div class="legenda-orari">
            <h1 class="footer-subtitle"> ${legenda.titolo || "Legenda"} </h1>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori.aperto || "#00FF7F"};margin-right:8px;border-radius:50%;display:inline-block;"></span>${legenda.testo.aperto || "Aperto"}</div>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori["in chiusura"] || "#FFD700"};margin-right:8px;border-radius:50%;display:inline-block;"></span><span id="testo-in-chiusura">${testoInChiusuraSpan}</span></div>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori.chiuso || "orange"};margin-right:8px;border-radius:50%;display:inline-block;"></span>${legenda.testo.chiuso || "Chiuso"}</div>
            ${stagioniHTML}
          </div>
        </div>

      </div>
      <div class="footer-map"><div id="map"></div></div>
    </div>
    <div class="footer-bottom">
      <p>© ${oggiReal.getFullYear()} ${info.titolo || ""}. Tutti i diritti riservati.${info.p_iva ? ` - P.IVA ${info.p_iva}` : ""}</p>
    </div>
  `;
}