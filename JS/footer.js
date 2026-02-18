// ============================================================
// Footer dynamic content and map initialization
// ============================================================

// ============================================================
// DateUtils — utility statiche pure
// ============================================================
class DateUtils {
  static formatDM(date) {
    const giorno = String(date.getDate()).padStart(2, "0");
    const mese = String(date.getMonth() + 1).padStart(2, "0");
    return `${giorno}/${mese}`;
  }

  static parseDate(dateStr, year) {
    const [day, month] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  static formatPhone(phoneNumber) {
    const cleaned = phoneNumber.replace(/\s/g, "");
    if (cleaned.startsWith("+39")) {
      const prefix = "+39";
      const rest = cleaned.substring(3);
      if (rest.length === 10)
        return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
      if (rest.length === 9)
        return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 7)} ${rest.substring(7)}`;
    }
    return phoneNumber;
  }

  static calcolaPasqua(anno) {
    const a = anno % 19;
    const b = Math.floor(anno / 100);
    const c = anno % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mese = Math.floor((h + l - 7 * m + 114) / 31);
    const giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anno, mese - 1, giorno);
  }

  static getDatePasquali(anno) {
    const pasqua = DateUtils.calcolaPasqua(anno);
    const pasquetta = new Date(pasqua);
    pasquetta.setDate(pasquetta.getDate() + 1);
    return {
      pasqua: DateUtils.formatDM(pasqua),
      pasquetta: DateUtils.formatDM(pasquetta),
    };
  }
}

// ============================================================
// ChiusuraManager — logica chiusure (ferie, festività, extra)
// ============================================================
class ChiusuraManager {
  constructor(data) {
    this.data = data;
  }

  getUnifiedFerieDates(year) {
    const unifiedDates = new Set();
    const giorniExtraFerie =
      (this.data.giorniChiusuraExtra && this.data.giorniChiusuraExtra.ferie) ||
      [];

    giorniExtraFerie.forEach((date) => unifiedDates.add(date));

    const feriePeriods = this.data.ferie || [];
    for (const period of feriePeriods) {
      if (!period.inizio || !period.fine) continue;

      const dataInizio = DateUtils.parseDate(period.inizio, year);
      let dataFine = DateUtils.parseDate(period.fine, year);

      if (dataInizio.getTime() > dataFine.getTime()) {
        dataFine = DateUtils.parseDate(period.fine, year + 1);
      }

      const currentDate = new Date(dataInizio);
      while (currentDate.getTime() <= dataFine.getTime()) {
        unifiedDates.add(DateUtils.formatDM(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return unifiedDates;
  }

  findConsecutiveClosureEnd(startDate, unifiedFerieDates) {
    const startDateDM = DateUtils.formatDM(startDate);

    if (!unifiedFerieDates.has(startDateDM)) {
      return startDateDM;
    }

    const currentDate = new Date(startDate);
    let endDate = new Date(startDate);

    while (true) {
      currentDate.setDate(currentDate.getDate() + 1);
      const nextDateDM = DateUtils.formatDM(currentDate);

      if (!unifiedFerieDates.has(nextDateDM)) {
        return DateUtils.formatDM(endDate);
      }

      endDate = new Date(currentDate);
    }
  }

  getMotivoExtraForDate(dataFormattata) {
    const motiviExtra = this.data.giorniChiusuraExtra?.["motivi-extra"] || [];

    for (const item of motiviExtra) {
      if (item.giorno === dataFormattata && item.giorno !== "") {
        return item.motivo || "Motivi Extra";
      }
    }
    return null;
  }

  getOrariExtraForDate(dataFormattata, dayOfWeek) {
    const orariExtra = this.data.orariExtra || [];
    const nomiGiorni = this.data.nomiGiorni;

    for (const item of orariExtra) {
      if (item.giorno === dataFormattata && item.orari) {
        const nomeGiorno = nomiGiorni[dayOfWeek];
        return `${nomeGiorno}: ${item.orari} (${item.motivo})`;
      }
    }
    return null;
  }

  getSingleDayClosureReason(
    checkDate,
    unifiedFerieDates,
    unifiedFerieDatesNextYear = null,
  ) {
    const festivita = this.data.festivita || [];

    // Calcola le date pasquali per l'anno corrente
    const annoCorrente = checkDate.getFullYear();
    const datePasqualiCorrente = DateUtils.getDatePasquali(annoCorrente);

    // Crea un array con tutte le festività incluse Pasqua e Pasquetta
    const festivitaComplete = [
      ...festivita,
      datePasqualiCorrente.pasqua,
      datePasqualiCorrente.pasquetta,
    ];

    const dateToCheck = new Date(checkDate);
    const dataFormattata = DateUtils.formatDM(dateToCheck);

    if (festivitaComplete.includes(dataFormattata)) {
      return { reason: "festivita", dataChiusura: dataFormattata };
    }

    if (unifiedFerieDates.has(dataFormattata)) {
      const fineChiusura = this.findConsecutiveClosureEnd(
        dateToCheck,
        unifiedFerieDates,
      );
      return { reason: "ferie", dataChiusura: fineChiusura };
    }

    if (
      unifiedFerieDatesNextYear &&
      unifiedFerieDatesNextYear.has(dataFormattata)
    ) {
      const fineChiusura = this.findConsecutiveClosureEnd(
        dateToCheck,
        unifiedFerieDatesNextYear,
      );
      return { reason: "ferie", dataChiusura: fineChiusura };
    }

    const motivoExtra = this.getMotivoExtraForDate(dataFormattata);
    if (motivoExtra) {
      return {
        reason: "motivi-extra",
        dataChiusura: dataFormattata,
        motivoSpecifico: motivoExtra,
      };
    }

    return null;
  }
}

// ============================================================
// AperturaChecker — determina lo stato aperto/chiuso/in-chiusura
// ============================================================
class AperturaChecker {
  constructor(data, eChiusoOggi, orariExtraOggi) {
    this.data = data;
    this.eChiusoOggi = eChiusoOggi;
    this.orariExtraOggi = orariExtraOggi;
  }

  static parseTime(t) {
    const [ore, minuti] = t.split(":");
    return Number.parseInt(ore) * 100 + Number.parseInt(minuti);
  }

  check(orariString, oraCorrente) {
    if (this.eChiusoOggi && !this.orariExtraOggi)
      return { stato: "chiuso", minutiAllaChiusura: 0 };

    if (!orariString || orariString.toLowerCase().includes("chiuso"))
      return { stato: "chiuso", minutiAllaChiusura: 0 };

    const orariMatch = orariString.match(
      /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g,
    );
    if (!orariMatch) return { stato: "chiuso", minutiAllaChiusura: 0 };

    for (const range of orariMatch) {
      const [inizio, fine] = range.split("-").map((s) => s.trim());
      const inizioTime = AperturaChecker.parseTime(inizio);
      const fineTime = AperturaChecker.parseTime(fine);

      let fineMinuti = Math.floor(fineTime % 100);
      let fineOre = Math.floor(fineTime / 100);

      const minutiPrimaChiusura = this.data.minutiInChiusura || 30;
      fineMinuti -= minutiPrimaChiusura;
      if (fineMinuti < 0) {
        fineMinuti += 60;
        fineOre -= 1;
      }
      const inChiusuraTime = fineOre * 100 + fineMinuti;

      if (oraCorrente >= inizioTime && oraCorrente < fineTime) {
        if (oraCorrente >= inChiusuraTime) {
          const oreCorr = Math.floor(oraCorrente / 100);
          const minCorr = oraCorrente % 100;
          const oreFine = Math.floor(fineTime / 100);
          const minFine = fineTime % 100;
          const minutiTotaliCorrente = oreCorr * 60 + minCorr;
          const minutiTotaliFine = oreFine * 60 + minFine;
          const minutiMancanti = minutiTotaliFine - minutiTotaliCorrente;
          return { stato: "in-chiusura", minutiAllaChiusura: minutiMancanti };
        }
        return { stato: "aperto", minutiAllaChiusura: 0 };
      }
    }

    return { stato: "chiuso", minutiAllaChiusura: 0 };
  }
}

// ============================================================
// MapManager — gestione iframe OpenStreetMap
// ============================================================
class MapManager {
  constructor(containerId = "map") {
    this.containerId = containerId;
    this.currentMapCoordinates = null;
  }

  init(lat, lon) {
    const mapContainer = document.getElementById(this.containerId);
    if (!mapContainer) return;

    // Verifica se le coordinate sono cambiate
    const newCoordinates = `${lat},${lon}`;
    if (this.currentMapCoordinates === newCoordinates) {
      console.log("Coordinate invariate - mappa non ricaricata");
      return;
    }

    // Aggiorna le coordinate correnti
    this.currentMapCoordinates = newCoordinates;

    // Svuota il contenitore prima di creare una nuova mappa
    mapContainer.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = "0";
    iframe.style.border = "none";

    const zoomLevel = 0.0005;
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${
      lon - zoomLevel
    },${lat - zoomLevel},${lon + zoomLevel},${
      lat + zoomLevel
    }&layer=mapnik&marker=${lat},${lon}`;
    iframe.loading = "lazy";

    mapContainer.appendChild(iframe);
    console.log("Mappa inizializzata con coordinate:", newCoordinates);
  }
}

// ============================================================
// FooterRenderer — costruisce e aggiorna l'HTML del footer
// ============================================================
class FooterRenderer {
  constructor(data, chiusuraManager) {
    this.data = data;
    this.cm = chiusuraManager;
  }

  // Costruisce il contesto condiviso (stato apertura, ferie, ecc.)
  buildContext(giornoPartenza) {
    const oggiReal = giornoPartenza || new Date();
    const oggi = new Date(oggiReal);
    oggi.setHours(0, 0, 0, 0);

    const giornoSettimana = oggiReal.getDay();
    const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();
    const indiceGiornoCorrente =
      giornoSettimana === 0 ? 6 : giornoSettimana - 1;

    const unifiedFerieDates = this.cm.getUnifiedFerieDates(oggi.getFullYear());
    const unifiedFerieDatesNextYear = this.cm.getUnifiedFerieDates(
      oggi.getFullYear() + 1,
    );

    const dataOggiFormattata = DateUtils.formatDM(oggiReal);
    const orariExtraOggi = this.cm.getOrariExtraForDate(
      dataOggiFormattata,
      giornoSettimana,
    );

    const singleDayClosure = this.cm.getSingleDayClosureReason(
      oggiReal,
      unifiedFerieDates,
      unifiedFerieDatesNextYear,
    );

    const isFestivita =
      singleDayClosure && singleDayClosure.reason === "festivita";
    const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
    const isMotivoExtra =
      singleDayClosure && singleDayClosure.reason === "motivi-extra";

    let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

    const orariDaUsareOggi =
      orariExtraOggi || this.data.orari[indiceGiornoCorrente];
    if (orariExtraOggi) eChiusoOggi = false;

    const checker = new AperturaChecker(this.data, eChiusoOggi, orariExtraOggi);
    const statoApertura = checker.check(orariDaUsareOggi, oraCorrente);

    return {
      oggiReal,
      oggi,
      giornoSettimana,
      oraCorrente,
      indiceGiornoCorrente,
      unifiedFerieDates,
      unifiedFerieDatesNextYear,
      orariExtraOggi,
      eChiusoOggi,
      statoApertura,
    };
  }

  // Costruisce l'HTML di un singolo giorno nella lista orari
  buildGiornoHTML(dataDelGiorno, i, ctx) {
    const {
      unifiedFerieDates,
      unifiedFerieDatesNextYear,
      eChiusoOggi,
      statoApertura,
    } = ctx;
    const legenda = this.data.legendaOrari || { colori: {}, testo: {} };
    const orari = this.data.orari || [];

    const dayOfWeek = dataDelGiorno.getDay();
    const orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const dataFormattata = DateUtils.formatDM(dataDelGiorno);
    const orariExtraGiorno = this.cm.getOrariExtraForDate(
      dataFormattata,
      dayOfWeek,
    );
    const nomeGiorno = this.data.nomiGiorni[dayOfWeek];

    let testoOrario;
    let colore = "";
    let peso = "";
    let testoExtra = "";

    if (orariExtraGiorno) {
      testoOrario = orariExtraGiorno;
    } else {
      testoOrario = orari[orariIndex];
      const closureCheck = this.cm.getSingleDayClosureReason(
        dataDelGiorno,
        unifiedFerieDates,
        unifiedFerieDatesNextYear,
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
  }

  // Costruisce l'HTML completo della lista orari (7 giorni)
  buildOrariHTML(ctx) {
    const { oggi } = ctx;
    const giorni = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(oggi);
      d.setDate(oggi.getDate() + i);
      return d;
    });
    return giorni.map((d, i) => this.buildGiornoHTML(d, i, ctx)).join("");
  }

  // Crea l'HTML completo del footer (identico all'originale)
  createHTML(giornoPartenza) {
    const ctx = this.buildContext(giornoPartenza);
    const { oggiReal, statoApertura } = ctx;

    const data = this.data;
    const info = data.info || {};
    const contatti = data.contatti || {};
    const orari = data.orari || [];
    const social = data.social || {};
    const legenda = data.legendaOrari || { colori: {}, testo: {} };

    const orariHtml = this.buildOrariHTML(ctx);

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
                )}">${DateUtils.formatPhone(contatti.telefono)}</a></li>`
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
          <h4 class="footer-subtitle">Orari</h4>
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

  // Aggiorna SOLO la lista orari nel DOM (senza ricostruire tutto il footer)
  updateOrariDOM(ctx) {
    const { statoApertura } = ctx;
    const legenda = this.data.legendaOrari || { colori: {}, testo: {} };

    const lista = document.querySelector("#orari-footer");
    if (!lista) return;

    lista.innerHTML = this.buildOrariHTML(ctx);

    const testoInChiusuraSpan = document.getElementById("testo-in-chiusura");
    if (testoInChiusuraSpan) {
      if (statoApertura.stato === "in-chiusura") {
        const minuti = statoApertura.minutiAllaChiusura;
        const testoMinuti = minuti === 1 ? "minuto" : "minuti";
        testoInChiusuraSpan.textContent = `In chiusura tra ${minuti} ${testoMinuti}`;
      } else {
        testoInChiusuraSpan.textContent =
          legenda.testo["in chiusura"] || "In chiusura";
      }
    }
  }
}

// ============================================================
// FooterManager — orchestratore principale
// ============================================================
class FooterManager {
  constructor(footerId = "Contatti") {
    this.footerId = footerId;
    this.data = null;
    this.map = new MapManager("map");
    this.chiusuraManager = null;
    this.renderer = null;
    this._orariInterval = null;
  }

  get footerEl() {
    return document.getElementById(this.footerId);
  }

  async init() {
    if (!this.footerEl) return;

    const jsonPath = window.location.pathname.includes("/Projects/")
      ? "../JSON/footer.json"
      : "JSON/footer.json";

    try {
      const response = await fetch(jsonPath);
      this.data = await response.json();
      this.chiusuraManager = new ChiusuraManager(this.data);
      this.renderer = new FooterRenderer(this.data, this.chiusuraManager);

      this.render();
      this.scheduleFooterRefreshAtMidnight();
    } catch (error) {
      console.error("Errore nel caricamento dei dati del footer:", error);
      this.footerEl.innerHTML = `<p style="text-align:center; color: white;">Impossibile caricare le informazioni del footer.</p>`;
    }
  }

  render(giornoPartenza) {
    if (!this.footerEl || !this.renderer) return;

    this.footerEl.innerHTML = this.renderer.createHTML(giornoPartenza);

    setTimeout(() => {
      const mappa = this.data?.mappa;
      if (mappa?.latitudine && mappa?.longitudine) {
        this.map.init(mappa.latitudine, mappa.longitudine);
      }

      document.dispatchEvent(new CustomEvent("footerLoaded"));
      this.scheduleOrariUpdates();
    }, 100);
  }

  scheduleOrariUpdates() {
    if (this._orariInterval) clearInterval(this._orariInterval);

    const now = new Date();
    const secondsToNextMinute = 60 - now.getSeconds();

    setTimeout(() => {
      this.aggiornaColoreOrari();
      this._orariInterval = setInterval(
        () => this.aggiornaColoreOrari(),
        60000,
      );
    }, secondsToNextMinute * 1000);

    this.aggiornaColoreOrari();
  }

  aggiornaColoreOrari() {
    if (!this.renderer || !this.chiusuraManager) return;
    if (!this.data.orari?.length) return;

    const ctx = this.renderer.buildContext(new Date());
    this.renderer.updateOrariDOM(ctx);
  }

  scheduleFooterRefreshAtMidnight() {
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
      if (this.footerEl && this.data) {
        // Passa come giorno di partenza il nuovo giorno reale
        this.render(new Date());

        // Riprogramma il refresh per la prossima mezzanotte
        this.scheduleFooterRefreshAtMidnight();
      }
    }, msUntilMidnight);
  }
}

// ============================================================
// Bootstrap
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const footer = new FooterManager("Contatti");
  footer.init();
});
