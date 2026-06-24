// ============================================================
// creazione_html.js — Costruzione HTML del footer
// ============================================================

function getWhatsappURL(contatti) {
  if (!contatti || !contatti.telefono) return null;
  const numSoloCifre = contatti.telefono.replace(/[^\d]/g, "");
  return `https://wa.me/${numSoloCifre}`;
}

function getAllStagioniHTML(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length)
    return `<div id="descrizione-stagione" style="display:none;"></div>`;

  const ref = dataRiferimento || new Date();
  const stagioneAttivaResult = getStagioneAttivaConDate(data, ref);
  const stagioneAttiva = stagioneAttivaResult
    ? stagioneAttivaResult.stagione
    : null;

  const valide = stagioni.filter(function (s) {
    return s.nome && s.orari;
  });
  const attive = valide.filter(function (s) {
    return stagioneAttiva && s.nome === stagioneAttiva.nome;
  });
  const nonAttive = valide.filter(function (s) {
    return !stagioneAttiva || s.nome !== stagioneAttiva.nome;
  });

  function _riga(s, isAttiva) {
    let annoInizio, annoFine;
    if (isAttiva && stagioneAttivaResult) {
      annoInizio = stagioneAttivaResult.annoInizio;
      annoFine = stagioneAttivaResult.annoFine;
    } else {
      const prossima = _getProssimaIstanzaStagione(s, ref);
      annoInizio = prossima.annoInizio;
      annoFine = prossima.annoFine;
    }
    const testo = _testoStagioneConAnni(s, annoInizio, annoFine);
    return `<div style="${isAttiva ? "font-weight:bold;" : "opacity:0.65;"}">${testo}</div>`;
  }

  var righe = [];
  for (var i = 0; i < attive.length; i++) {
    righe.push(_riga(attive[i], true));
  }
  for (var i = 0; i < nonAttive.length; i++) {
    righe.push(_riga(nonAttive[i], false));
  }

  return `<div id="descrizione-stagione" style="margin-top:14px;font-size:0.85em;">${righe.join("")}</div>`;
}

// ── Genera HTML per le chiusure programmate nel footer ──────────────────────
// Mostra:
//   - se c'è una chiusura ATTIVA → banner rosso con i dettagli
//   - poi le 2 prossime chiusure imminenti (ferie + festività + Pasqua)
// ─────────────────────────────────────────────────────────────────────────────
function getClosuresHTML(data, oggiReal) {
  const oggi = oggiReal || new Date();

  // Usa la nuova funzione unificata (ferie + festività + Pasqua, 365 giorni)
  const allClosures = getAllUpcomingClosures(data, oggi, 365);

  if (!allClosures.length) return "";

  var html = "";

  // ── Chiusure attive ──
  const active = allClosures.filter(function (c) {
    return c.tipo === "attiva";
  });
  for (var i = 0; i < active.length; i++) {
    var c = active[i];
    var motivoTesto =
      c.label === "Festività"
        ? "Festività"
        : "Ferie" + (c.label !== "Ferie" ? " - " + c.label : "");
    html += '<div class="footer-closure-alert">';
    html +=
      '<span class="material-icons">warning</span> <strong>🔴 CHIUSO - ' +
      motivoTesto.toUpperCase() +
      "</strong>";
    if (!c.isSingleDay) {
      html += "<br>dal " + c.inizioFmt + " al " + c.fineFmt;
    } else {
      html += "<br>" + c.inizioFmt;
    }
    html += "</div>";
  }

  // ── Prossime 2 chiusure (non ancora iniziate) ──
  const upcoming = allClosures.filter(function (c) {
    return c.tipo === "imminente";
  });
  const toShow = upcoming.slice(0, 2);

  if (toShow.length > 0) {
    html += '<div class="footer-future-closures">';
    html +=
      '<div class="footer-future-closures-title"><span>📅</span> Prossime chiusure:</div>';

    for (var j = 0; j < toShow.length; j++) {
      var c = toShow[j];
      var giorni = c.giorni;
      var giornoTesto =
        giorni === 0
          ? "oggi"
          : giorni === 1
            ? "domani"
            : "tra " + giorni + " giorni";

      if (c.isSingleDay) {
        html +=
          '<div class="footer-future-closures-item">• ' +
          c.inizioFmt +
          ": " +
          c.label +
          " (" +
          giornoTesto +
          ")</div>";
      } else {
        html +=
          '<div class="footer-future-closures-item">• ' +
          c.inizioFmt +
          " → " +
          c.fineFmt +
          ": " +
          c.label +
          " (" +
          giornoTesto +
          ")</div>";
      }
    }
    html += "</div>";
  }

  return html;
}

function _getCountdownHTML(transizione) {
  if (!transizione || transizione.eCambioOggi) return "";

  const stagioneAttivaLabel = transizione.da.toUpperCase();
  const stagioneProssimaLabel = transizione.a.toUpperCase();
  const g = transizione.giorniMancanti;
  const preview = g === 1 ? "1g" : g + "g";

  var styleContenitore =
    "display:block; margin-bottom:10px; padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13); width: 240px; box-sizing: border-box;";

  return (
    '<div id="countdown-stagione" style="' +
    styleContenitore +
    '">' +
    '<div id="countdown-content-wrapper">' +
    '<div id="countdown-header-labels" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:0.78em;letter-spacing:0.08em;font-weight:600;">' +
    '<span id="countdown-label-attiva" style="display:flex;align-items:center;gap:5px;"></span>' +
    '<span id="countdown-label-prossima" style="opacity:0.55;"></span>' +
    "</div>" +
    '<div style="font-size:1.35em;font-weight:800;letter-spacing:0.12em;font-variant-numeric:tabular-nums;" id="countdown-testo">' +
    preview +
    "</div>" +
    "</div>" +
    "</div>"
  );
}

function _calcolaTitoloOrari(transizione, nomeStagione) {
  if (transizione && !transizione.eCambioOggi) {
    return (
      'Orario <span style="font-weight:900;">' +
      transizione.da +
      '</span><span style="font-weight:400;opacity:0.6;">/' +
      transizione.a +
      "</span>"
    );
  }
  if (nomeStagione) return "Orario " + nomeStagione;
  return "Orario";
}

function createFooterHTML(data, giornoPartenza) {
  const oggiReal = giornoPartenza || new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);

  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();
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
    d.setDate(oggi.getDate() + i);
    giorniDaVisualizzare.push(d);
  }

  var orariHtmlItems = [];
  for (var i = 0; i < giorniDaVisualizzare.length; i++) {
    var dataDelGiorno = giorniDaVisualizzare[i];
    var colore = "";
    var peso = "";

    var dayOfWeek = dataDelGiorno.getDay();
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
      <p>© ${oggiReal.getFullYear()} ${info.titolo || ""}. Tutti i diritti riservati.${info.p_iva ? " - P.IVA " + info.p_iva : ""}</p>
    </div>
  `;
}
