// Footer dynamic content and map initialization
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
      }, 100);
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del footer:", error);
      footer.innerHTML = `<p style="text-align:center; color: white;">Impossibile caricare le informazioni del footer.</p>`;
    });
});

const formatDateDM = (date) => {
  const giorno = String(date.getDate()).padStart(2, "0");
  const mese = String(date.getMonth() + 1).padStart(2, "0");
  return `${giorno}/${mese}`;
};

function getUnifiedFerieDates(data, year) {
  const unifiedDates = new Set();
  const giorniExtraFerie =
    (data.giorniChiusuraExtra && data.giorniChiusuraExtra.ferie) || [];

  giorniExtraFerie.forEach((date) => unifiedDates.add(date));

  const parseDate = (dateStr, y) => {
    const [day, month] = dateStr.split("/").map(Number);
    return new Date(y, month - 1, day, 0, 0, 0, 0);
  };

  const feriePeriods = data.ferie || [];
  for (const period of feriePeriods) {
    if (!period.inizio || !period.fine) continue;

    let dataInizio = parseDate(period.inizio, year);
    let dataFine = parseDate(period.fine, year);

    if (dataInizio.getTime() > dataFine.getTime()) {
      dataFine = parseDate(period.fine, year + 1);
    }

    let currentDate = new Date(dataInizio);
    while (currentDate.getTime() <= dataFine.getTime()) {
      unifiedDates.add(formatDateDM(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return unifiedDates;
}

function findConsecutiveClosureEnd(startDate, unifiedFerieDates) {
  const startDateDM = formatDateDM(startDate);

  if (!unifiedFerieDates.has(startDateDM)) {
    return startDateDM;
  }

  let currentDate = new Date(startDate);
  let endDate = new Date(startDate);

  while (true) {
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateDM = formatDateDM(currentDate);

    if (!unifiedFerieDates.has(nextDateDM)) {
      return formatDateDM(endDate);
    }

    endDate = new Date(currentDate);
  }
}

function getMotivoExtraForDate(data, dataFormattata) {
  const motiviExtra = data.giorniChiusuraExtra?.["motivi-extra"] || [];

  for (const item of motiviExtra) {
    if (item.giorno === dataFormattata && item.giorno !== "") {
      return item.motivo || "Motivi Extra";
    }
  }
  return null;
}

function getOrariExtraForDate(data, dataFormattata, dayOfWeek) {
  const orariExtra = data.orariExtra || [];
  const nomiGiorni = data.nomiGiorni;

  for (const item of orariExtra) {
    if (item.giorno === dataFormattata && item.orari) {
      const nomeGiorno = nomiGiorni[dayOfWeek];
      return `${nomeGiorno}: ${item.orari} (${item.motivo})`;
    }
  }
  return null;
}

function getSingleDayClosureReason(
  checkDate,
  data,
  unifiedFerieDates,
  unifiedFerieDatesNextYear = null
) {
  const festivita = data.festivita || [];

  const dateToCheck = new Date(checkDate);
  const dataFormattata = formatDateDM(dateToCheck);

  if (festivita.includes(dataFormattata)) {
    return { reason: "festivita", dataChiusura: dataFormattata };
  }

  if (unifiedFerieDates.has(dataFormattata)) {
    const fineChiusura = findConsecutiveClosureEnd(
      dateToCheck,
      unifiedFerieDates
    );
    return {
      reason: "ferie",
      dataChiusura: fineChiusura,
    };
  }

  if (
    unifiedFerieDatesNextYear &&
    unifiedFerieDatesNextYear.has(dataFormattata)
  ) {
    const fineChiusura = findConsecutiveClosureEnd(
      dateToCheck,
      unifiedFerieDatesNextYear
    );
    return {
      reason: "ferie",
      dataChiusura: fineChiusura,
    };
  }

  const motivoExtra = getMotivoExtraForDate(data, dataFormattata);
  if (motivoExtra) {
    return {
      reason: "motivi-extra",
      dataChiusura: dataFormattata,
      motivoSpecifico: motivoExtra,
    };
  }

  return null;
}

function createFooterHTML(data) {
  const info = data.info || {};
  const contatti = data.contatti || {};
  const orari = data.orari || [];
  const social = data.social || {};
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  const mapsQuery = contatti.indirizzo
    ? encodeURIComponent(contatti.indirizzo)
    : "Via Villa, 26, 33072 Casarsa della Delizia PN";

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const indirizzoVisuale =
    contatti.indirizzo_visuale || contatti.indirizzo || "";

  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);
  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();
  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(
    data,
    oggi.getFullYear() + 1
  );

  const dataOggiFormattata = formatDateDM(oggiReal);
  const orariExtraOggi = getOrariExtraForDate(
    data,
    dataOggiFormattata,
    giornoSettimana
  );

  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates,
    unifiedFerieDatesNextYear
  );

  const isFestivita =
    singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra =
    singleDayClosure && singleDayClosure.reason === "motivi-extra";

  let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

  function checkStatoApertura(orariString) {
    if (eChiusoOggi && !orariExtraOggi) return { stato: "chiuso", minutiAllaChiusura: 0 };
    if (!orariString || orariString.toLowerCase().includes("chiuso"))
      return { stato: "chiuso", minutiAllaChiusura: 0 };

    const orariMatch = orariString.match(
      /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g
    );
    if (!orariMatch) return { stato: "chiuso", minutiAllaChiusura: 0 };

    const parseTime = (timeStr) => {
      const [ore, minuti] = timeStr.split(":");
      return parseInt(ore, 10) * 100 + parseInt(minuti, 10);
    };

    for (const intervallo of orariMatch) {
      const [inizio, fine] = intervallo.split("-").map((t) => t.trim());
      const inizioTime = parseTime(inizio);
      const fineTime = parseTime(fine);

      let fineMinuti = Math.floor(fineTime % 100);
      let fineOre = Math.floor(fineTime / 100);

      const minutiPrimaChiusura = data.minutiInChiusura || 30;
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

  const orariDaUsareOggi = orariExtraOggi || orari[indiceGiornoCorrente];

  if (orariExtraOggi) {
    eChiusoOggi = false;
  }

  const statoApertura = checkStatoApertura(orariDaUsareOggi);

  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const dataDelGiorno = new Date(oggi);
    dataDelGiorno.setDate(oggi.getDate() + i);
    dataDelGiorno.setHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(dataDelGiorno);
  }

  const orariHtml = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";
      let testoExtra = "";

      let dayOfWeek = dataDelGiorno.getDay();
      let orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const dataFormattata = formatDateDM(dataDelGiorno);

      // Prima controlla se c'è un orario extra per questo giorno
      const orariExtraGiorno = getOrariExtraForDate(
        data,
        dataFormattata,
        dayOfWeek
      );

      let testoOrario;
      const nomeGiorno = data.nomiGiorni[dayOfWeek];

      if (orariExtraGiorno) {
        // Se c'è un orario extra, vince su tutto
        testoOrario = orariExtraGiorno;
      } else {
        // Altrimenti, usa la logica standard
        testoOrario = orari[orariIndex];
        const closureCheck = getSingleDayClosureReason(dataDelGiorno, data, unifiedFerieDates, unifiedFerieDatesNextYear);
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
          colore = legenda.colori["chiuso"] || "orange";
        } else if (statoApertura.stato === "in-chiusura") {
          colore = legenda.colori["in chiusura"] || "#FFD700";
          const minuti = statoApertura.minutiAllaChiusura;
          const testoMinuti = minuti === 1 ? "1 minuto" : `${minuti} minuti`;
          testoExtra = ` (chiusura tra ${testoMinuti})`;
        } else {
          colore = legenda.colori["aperto"] || "#00FF7F";
        }
      } else {
        colore = legenda.colori["chiuso"] || "orange";
      }

      return `
        <li class="footer-item" style="color:${colore};${peso}">
          ${testoOrario}${testoExtra}
        </li>
      `;
    })
    .join("");

  let testoInChiusura = legenda.testo["in chiusura"] || "In chiusura";
  if (statoApertura.stato === "in-chiusura") {
    const minuti = statoApertura.minutiAllaChiusura;
    const testoMinuti = minuti === 1 ? "1 minuto" : `${minuti} minuti`;
    testoInChiusura = `In chiusura tra ${testoMinuti}`;
  }

  const legendaHtml = `
    <div class="legenda-orari" style="margin-top: 10px;">
      <div style="margin-bottom: 10px;">
        <span style="color: white; font-weight: bold; font-size: 1.2em;"><br>${legenda.titolo || "Legenda Orari"
    }</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="height: 12px; width: 12px; background-color: ${legenda.colori.aperto || "#00FF7F"
    }; margin-right: 8px; border-radius: 50%; display: inline-block;"></span>
        <span style="color: white;">${legenda.testo.aperto || "Aperto"}</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <span style="height: 12px; width: 12px; background-color: ${legenda.colori["in chiusura"] || "#FFD700"
    }; margin-right: 8px; border-radius: 50%; display: inline-block;"></span>
        <span id="testo-in-chiusura" style="color: white;">${testoInChiusura}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="height: 12px; width: 12px; background-color: ${legenda.colori.chiuso || "orange"
    }; margin-right: 8px; border-radius: 50%; display: inline-block;"></span>
        <span style="color: white;">${legenda.testo.chiuso || "Chiuso"}</span>
      </div>
    </div>
  `;

  return `
    <div class="footer-content">
      <div class="footer-grid">
        <div class="footer-section">
          <h3 class="footer-title">${info.titolo || ""}</h3>
          <p class="footer-text">${info.testo || ""}</p>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">Contatti</h4>
          <ul class="footer-list">
            ${contatti.telefono
      ? `
            <li class="footer-item">
              <span class="material-icons">phone</span>
              <a href="tel:${contatti.telefono}">${contatti.telefono}</a>
            </li>
            `
      : ""
    }
            ${contatti.email
      ? `
            <li class="footer-item">
              <span class="material-icons">email</span>
              <a href="mailto:${contatti.email}">${contatti.email}</a>
            </li>
            `
      : ""
    }
            ${indirizzoVisuale
      ? `
            <li class="footer-item">
              <span class="material-icons">location_on</span>
              <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">
                ${indirizzoVisuale}
              </a>
            </li>
            `
      : ""
    }
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">Orari</h4>
          <ul id="orari-footer" class="footer-list">
            ${orariHtml}
          </ul>
          ${legendaHtml}
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">Seguici</h4>
          <div class="social-links">
            ${social.facebook
      ? `<a href="${social.facebook}" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                     <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" style="width: 24px; height: 24px;">
                   </a>`
      : ""
    }
            ${social.instagram
      ? `<a href="${social.instagram}" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                     <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram" style="width: 24px; height: 24px;">
                   </a>`
      : ""
    }
            ${social.whatsapp
      ? `<a href="${social.whatsapp}" class="social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                     <img src="https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png" alt="WhatsApp" style="width: 24px; height: 24px;">
                   </a>`
      : ""
    }
          </div>
        </div>
      </div>

      <div class="footer-map">
        <div id="map"></div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>
        © ${new Date().getFullYear()} ${info.titolo || ""
    }. Tutti i diritti riservati.
        ${info.p_iva ? ` - P.IVA ${info.p_iva}` : ""}
      </p>
    </div>
  `;
}

function aggiornaColoreOrari(data) {
  const orari = data.orari || [];
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  if (!orari.length) return;

  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);
  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();

  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(
    data,
    oggi.getFullYear() + 1
  );

  const dataOggiFormattata = formatDateDM(oggiReal);
  const orariExtraOggi = getOrariExtraForDate(
    data,
    dataOggiFormattata,
    giornoSettimana
  );

  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates,
    unifiedFerieDatesNextYear
  );
  const isFestivita =
    singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra =
    singleDayClosure && singleDayClosure.reason === "motivi-extra";

  let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

  function checkStatoApertura(orariString) {
    if (eChiusoOggi && !orariExtraOggi) return { stato: "chiuso", minutiAllaChiusura: 0 };

    if (!orariString || orariString.toLowerCase().includes("chiuso"))
      return { stato: "chiuso", minutiAllaChiusura: 0 };

    const orariMatch = orariString.match(
      /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g
    );
    if (!orariMatch) return { stato: "chiuso", minutiAllaChiusura: 0 };

    const parseTime = (t) => {
      const [ore, minuti] = t.split(":");
      return parseInt(ore) * 100 + parseInt(minuti);
    };

    for (const range of orariMatch) {
      const [inizio, fine] = range.split("-").map((s) => s.trim());
      const inizioTime = parseTime(inizio);
      const fineTime = parseTime(fine);

      let fineMinuti = Math.floor(fineTime % 100);
      let fineOre = Math.floor(fineTime / 100);

      const minutiPrimaChiusura = data.minutiInChiusura || 30;
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

  const orariDaUsareOggi = orariExtraOggi || orari[indiceGiornoCorrente];

  if (orariExtraOggi) {
    eChiusoOggi = false;
  }

  const statoApertura = checkStatoApertura(orariDaUsareOggi);

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

      let dayOfWeek = dataDelGiorno.getDay();
      let orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const dataFormattata = formatDateDM(dataDelGiorno);
      // Prima controlla se c'è un orario extra per questo giorno
      const orariExtraGiorno = getOrariExtraForDate(
        data,
        dataFormattata,
        dayOfWeek
      );

      let testoOrario;
      const nomeGiorno = data.nomiGiorni[dayOfWeek];

      if (orariExtraGiorno) {
        // Se c'è un orario extra, vince su tutto
        testoOrario = orariExtraGiorno;
      } else {
        // Altrimenti, usa la logica standard
        testoOrario = orari[orariIndex];
        const closureCheck = getSingleDayClosureReason(dataDelGiorno, data, unifiedFerieDates, unifiedFerieDatesNextYear);
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
      testoInChiusuraSpan.textContent =
        legenda.testo["in chiusura"] || "In chiusura";
    }
  }
}

function initMap(lat, lon) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const iframe = document.createElement("iframe");
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";
  iframe.style.border = "none";

  const zoomLevel = 0.0005;
  iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - zoomLevel
    },${lat - zoomLevel},${lon + zoomLevel},${lat + zoomLevel
    }&layer=mapnik&marker=${lat},${lon}`;
  iframe.loading = "lazy";

  mapContainer.appendChild(iframe);
}
