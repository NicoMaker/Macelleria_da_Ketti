// ============================================================
// creazione_html.js — Costruzione HTML del footer
// Dipende da: date-utils.js, Gestisci_chiusure.js, gestisci_apertura.js
// ============================================================

// ── Testo descrittivo per una singola stagione ───────────────
function _testoStagione(stagione) {
  const nome = stagione.nome || "";
  let testo = `Orario ${nome}`;
  if (stagione.inizio && stagione.fine)
    testo += `: dal ${stagione.inizio} al ${stagione.fine}`;
  else if (stagione.inizio) testo += `: dal ${stagione.inizio}`;
  else if (stagione.fine) testo += `: fino al ${stagione.fine}`;
  return testo;
}

// ── HTML con tutte le stagioni (quella attiva in grassetto) ──
function getAllStagioniHTML(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length)
    return `<div id="descrizione-stagione" style="display:none;"></div>`;

  const stagioneAttiva = getStagioneAttiva(data, dataRiferimento);

  const righe = stagioni
    .filter((s) => s.nome)
    .map((s) => {
      const testo = _testoStagione(s);
      const isAttiva = stagioneAttiva && stagioneAttiva.nome === s.nome;
      if (isAttiva) {
        return `<div style="font-weight:bold;">${testo}</div>`;
      }
      return `<div style="opacity:0.65;">${testo}</div>`;
    })
    .join("");

  return `<div id="descrizione-stagione" style="margin-top:14px;font-size:0.85em;">${righe}</div>`;
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

  // Orari attivi: stagionali se presenti, altrimenti base
  const { orari, nomeStagione } = getOrariAttiviOggi(data, oggiReal);

  // Titolo sezione orari: "Orario Estivo" / "Orario Invernale" / "Orari"
  const titoloOrari = nomeStagione ? `Orario ${nomeStagione}` : "Orari";

  // HTML con tutte le stagioni per la legenda
  const stagioniHTML = getAllStagioniHTML(data, oggiReal);

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

  // Prossimi 7 giorni
  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    giorniDaVisualizzare.push(d);
  }

  // Costruzione HTML degli orari
  const orariHtml = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";

      const dayOfWeek = dataDelGiorno.getDay();
      const orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const dataFmt = formatDateDM(dataDelGiorno);
      const nomeGiorno = data.nomiGiorni[dayOfWeek];
      const orariExtraGiorno = getOrariExtraForDate(data, dataFmt, dayOfWeek);

      // Per ogni giorno usa la stagione corretta (potrebbe cambiare a cavallo)
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
      <!-- Sezioni info+contatti, orari e social -->
      <div class="footer-grid">
       <!-- Tradizione e qualità + Contatti -->
      <div class="footer-section footer-section-tradizione-contatti">
        <h3 class="footer-title">${info.titolo || ""}</h3>
        <p class="footer-text">${info.testo || ""}</p>

        <h4 class="footer-subtitle">Contatti</h4>
        <ul class="footer-list">
          ${
            contatti.telefono
              ? `<li class="footer-item"><span class="material-icons">phone</span> <a href="tel:${contatti.telefono.replace(
                  /\s/g,
                  "",
                )}">${formatPhoneNumber(contatti.telefono)}</a></li>`
              : ""
          }
          ${
            contatti.email
              ? `<li class="footer-item"><span class="material-icons">email</span> <a href="mailto:${contatti.email}">${contatti.email}</a></li>`
              : ""
          }
          ${
            contatti.indirizzo
              ? `<li class="footer-item"><span class="material-icons">location_on</span> <a href="${contatti.indirizzo}" target="_blank">${contatti.indirizzo_visuale}</a></li>`
              : ""
          }
        </ul>
      </div>


        <!-- Orari -->
        <div class="footer-section">
          <h4 id="titolo-orari" class="footer-subtitle">${titoloOrari}</h4>
          <ul id="orari-footer" class="footer-list">${orariHtml}</ul>
        </div>

        <!-- Social + Legenda -->
        <div class="footer-section">
          <h4 class="footer-subtitle">Seguici</h4>
          <div class="social-links">
            ${
              social.facebook
                ? `<a href="${social.facebook}" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" style="width:24px;height:24px;"></a>`
                : ""
            }
            ${
              social.instagram
                ? `<a href="${social.instagram}" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" style="width:24px;height:24px;"></a>`
                : ""
            }
            ${
              social.whatsapp
                ? `<a href="${social.whatsapp}" target="_blank"><img src="https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png" style="width:24px;height:24px;"></a>`
                : ""
            }
          </div>
          <div class="legenda-orari">
            <h1 class="footer-subtitle"> ${legenda.titolo || "Legenda"} </h1>
            <div><span style="height:12px;width:12px;background-color:${
              legenda.colori.aperto || "#00FF7F"
            };margin-right:8px;border-radius:50%;display:inline-block;"></span>${
              legenda.testo.aperto || "Aperto"
            }</div>
            <div><span style="height:12px;width:12px;background-color:${
              legenda.colori["in chiusura"] || "#FFD700"
            };margin-right:8px;border-radius:50%;display:inline-block;"></span><span id="testo-in-chiusura">${testoInChiusuraSpan}</span></div>
            <div><span style="height:12px;width:12px;background-color:${
              legenda.colori.chiuso || "orange"
            };margin-right:8px;border-radius:50%;display:inline-block;"></span>${
              legenda.testo.chiuso || "Chiuso"
            }</div>
            ${stagioniHTML}
          </div>
        </div>
      </div>

      <div class="footer-map"><div id="map"></div></div>
    </div>
    <div class="footer-bottom">
      <p>© ${oggiReal.getFullYear()} ${
        info.titolo || ""
      }. Tutti i diritti riservati.${info.p_iva ? ` - P.IVA ${info.p_iva}` : ""}</p>
    </div>
    `;
}
