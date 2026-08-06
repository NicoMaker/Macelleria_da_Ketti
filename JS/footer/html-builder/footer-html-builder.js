// ============================================================
// footer-html-builder.js — Costruzione HTML completa del footer
// Dipende da: whatsapp-link.js, seasons-html.js, closures-html.js,
//             countdown-html.js, schedule-title-html.js,
//             season-calculator.js, closure-lookup.js,
//             opening-status-checker.js, time-format-utils.js
// ============================================================

function createFooterHTML(data, giornoPartenza) {
  const oggiReal = giornoPartenza || getShopNow();
  const oggi = new Date(oggiReal);
  oggi.setUTCHours(0, 0, 0, 0);

  const giornoSettimana = oggiReal.getUTCDay();
  const oraCorrente = oggiReal.getUTCHours() * 100 + oggiReal.getUTCMinutes();
  const indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  const info = data.info || {};
  const contatti = data.contatti || {};
  const social = data.social || {};
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  const whatsappURL = getWhatsappURL(contatti);

  configuraCambioStagione(data);

  const orariObj = getOrariAttiviOggi(data, oggiReal);
  const orari = orariObj.orari;
  const nomeStagione = orariObj.nomeStagione;
  const transizione = getRilevaTransizioneStagione(data, oggiReal);
  const titoloOrari = _calcolaTitoloOrari(transizione, nomeStagione);
  const countdownHTML = _getCountdownHTML(transizione);
  const stagioniHTML = getAllStagioniHTML(data, oggiReal);
  const closuresHTML = getClosuresHTML(data, oggiReal);

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
  const orariDaUsareOggi = orariExtraOggi || orari[indiceGiornoCorrente];
  if (orariExtraOggi) eChiusoOggi = false;

  const statoApertura = checkStatoApertura(
    orariDaUsareOggi,
    oraCorrente,
    eChiusoOggi,
    orariExtraOggi,
    data.minutiInChiusura,
  );

  const giorniDaVisualizzare = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(oggi);
    d.setUTCDate(oggi.getUTCDate() + i);
    d.setUTCHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(d);
  }

  var orariHtmlItems = [];
  for (var i = 0; i < giorniDaVisualizzare.length; i++) {
    var dataDelGiorno = giorniDaVisualizzare[i];
    var colore = "";
    var peso = "";

    var dayOfWeek = dataDelGiorno.getUTCDay();
    var orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    var dataFmt = formatDateDM(dataDelGiorno);
    var nomeGiorno = data.nomiGiorni[dayOfWeek];
    var orariExtraGiorno = getOrariExtraForDate(data, dataFmt, dayOfWeek);
    var orariGiornoObj = getOrariAttiviOggi(data, dataDelGiorno);
    var orariGiorno = orariGiornoObj.orari;

    var testoOrario;
    if (orariExtraGiorno) {
      testoOrario = orariExtraGiorno;
    } else {
      testoOrario = orariGiorno[orariIndex];
      var closureCheck = getSingleDayClosureReason(
        dataDelGiorno,
        data,
        unifiedFerieDates,
        unifiedFerieDatesNextYear,
      );
      if (closureCheck && closureCheck.reason === "festivita") {
        testoOrario = nomeGiorno + ": Chiuso (Festività)";
      } else if (closureCheck && closureCheck.reason === "ferie") {
        var motivo = closureCheck.motivoSpecifico || "Ferie";
        testoOrario =
          nomeGiorno +
          ": Chiuso (" +
          motivo +
          ") fino al " +
          closureCheck.dataChiusura;
      } else if (closureCheck && closureCheck.reason === "motivi-extra") {
        testoOrario =
          nomeGiorno + ": Chiuso (" + closureCheck.motivoSpecifico + ")";
      }
    }

    // Offset calcolato per la data di QUESTO giorno → gestisce i cambi di
    // ora legale che possono cadere tra oggi e un giorno futuro.
    var diffHoursGiorno = -getTimezoneOffsetHoursForDate(dataDelGiorno);
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
        var minuti = statoApertura.minutiAllaApertura;
        testoOrario +=
          " (" + minuti + " " + (minuti === 1 ? "minuto" : "minuti") + ")";
      } else if (statoApertura.stato === "in-chiusura") {
        colore = legenda.colori["in chiusura"] || "#FFD700";
        var minuti = statoApertura.minutiAllaChiusura;
        testoOrario +=
          " (" + minuti + " " + (minuti === 1 ? "minuto" : "minuti") + ")";
      } else {
        colore = legenda.colori.aperto || "#00FF7F";
      }
    }

    orariHtmlItems.push(
      '<li class="footer-item" style="color:' +
        colore +
        ";" +
        peso +
        '">' +
        testoOrario +
        "</li>",
    );
  }
  var orariHtml = orariHtmlItems.join("");

  var testoInAperturaSpan =
    statoApertura.stato === "in-apertura"
      ? "In apertura tra " +
        statoApertura.minutiAllaApertura +
        " " +
        (statoApertura.minutiAllaApertura === 1 ? "minuto" : "minuti")
      : legenda.testo["in apertura"] || "In apertura";

  var testoInChiusuraSpan =
    statoApertura.stato === "in-chiusura"
      ? "In chiusura tra " +
        statoApertura.minutiAllaChiusura +
        " " +
        (statoApertura.minutiAllaChiusura === 1 ? "minuto" : "minuti")
      : legenda.testo["in chiusura"] || "In chiusura";

  const userNow = getUserNow();
  const userTimeStr =
    String(userNow.getHours()).padStart(2, "0") +
    ":" +
    String(userNow.getMinutes()).padStart(2, "0");

  // Usa la nuova funzione per il testo dell'offset
  const offsetHours = getTimezoneOffsetHours();
  const offsetText = formatTimezoneOffsetText(offsetHours, info.titolo);

  return `
    <div class="footer-content">
      <div class="footer-grid">

        <div class="footer-section footer-section-tradizione-contatti">
          <h3 class="footer-title">${info.titolo || ""}</h3>
          <p class="footer-text">${info.testo || ""}</p>

          <h4 class="footer-subtitle">Contatti</h4>
          <ul class="footer-list">
            ${contatti.telefono ? '<li class="footer-item"><span class="material-icons">phone</span> <a href="tel:' + contatti.telefono.replace(/\s/g, "") + '">' + formatPhoneNumber(contatti.telefono) + "</a></li>" : ""}
            ${contatti.email ? '<li class="footer-item"><span class="material-icons">email</span> <a href="mailto:' + contatti.email + '">' + contatti.email + "</a></li>" : ""}
            ${contatti.indirizzo ? '<li class="footer-item"><span class="material-icons">location_on</span> <a href="' + contatti.indirizzo + '" target="_blank">' + contatti.indirizzo_visuale + "</a></li>" : ""}
          </ul>
        </div>

        <div class="footer-section">
          ${countdownHTML}
          <h4 id="titolo-orari" class="footer-subtitle" style="${transizione && !transizione.eCambioOggi ? "margin-top:14px;" : ""}">${titoloOrari}</h4>
          <ul id="orari-footer" class="footer-list">${orariHtml}</ul>
          <div class="user-local-time" style="margin-top:10px;font-size:0.8em;opacity:0.7;">
            <span>🕒 La tua ora locale: <span id="user-local-time-display">${userTimeStr}</span></span>
            <span style="display:block;font-size:0.85em;opacity:0.6;">${offsetText}</span>
          </div>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">Seguici</h4>
          <div class="social-links">
            ${social.facebook ? '<a href="' + social.facebook + '" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" style="width:24px;height:24px;"></a>' : ""}
            ${social.instagram ? '<a href="' + social.instagram + '" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" style="width:24px;height:24px;"></a>' : ""}
            ${whatsappURL ? '<a href="' + whatsappURL + '" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png" style="width:24px;height:24px;"></a>' : ""}
          </div>
          <div class="legenda-orari">
            <h1 class="footer-subtitle"> ${legenda.titolo || "Legenda"} </h1>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori["in apertura"] || "#87CEEB"};margin-right:8px;border-radius:50%;display:inline-block;"></span><span id="testo-in-apertura">${testoInAperturaSpan}</span></div>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori.aperto || "#00FF7F"};margin-right:8px;border-radius:50%;display:inline-block;"></span>${legenda.testo.aperto || "Aperto"}</div>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori["in chiusura"] || "#FFD700"};margin-right:8px;border-radius:50%;display:inline-block;"></span><span id="testo-in-chiusura">${testoInChiusuraSpan}</span></div>
            <div><span style="height:12px;width:12px;background-color:${legenda.colori.chiuso || "orange"};margin-right:8px;border-radius:50%;display:inline-block;"></span>${legenda.testo.chiuso || "Chiuso"}</div>
            ${stagioniHTML}
            ${closuresHTML}
          </div>
        </div>

      </div>
      <div class="footer-map"><div id="map"></div></div>
    </div>
    <div class="footer-bottom">
      <p>© ${oggiReal.getUTCFullYear()} ${info.titolo || ""}. Tutti i diritti riservati.${info.p_iva ? " - P.IVA " + info.p_iva : ""}</p>
    </div>
  `;
}
