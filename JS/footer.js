// Footer dynamic content and map initialization
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("Contatti");
  if (!footer) return;

  // Determine the correct path to footer.json based on the current URL
  const jsonPath = window.location.pathname.includes("/Projects/")
    ? "../JSON/footer.json"
    : "JSON/footer.json";

  // Load footer data
  fetch(jsonPath)
    .then((response) => response.json())
    .then((data) => {
      footer.innerHTML = createFooterHTML(data);

      // Initialize map after DOM update
      setTimeout(() => {
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }

        // Notifica altri script
        document.dispatchEvent(new CustomEvent("footerLoaded"));

        // --- Aggiorna i colori al minuto esatto ---
        const now = new Date();
        const secondsToNextMinute = 60 - now.getSeconds();

        setTimeout(() => {
          aggiornaColoreOrari(data);
          setInterval(() => aggiornaColoreOrari(data), 60000);
        }, secondsToNextMinute * 1000);

        // Primo aggiornamento immediato
        aggiornaColoreOrari(data);
      }, 100);
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del footer:", error);
      footer.innerHTML = `<p style="text-align:center; color: white;">Impossibile caricare le informazioni del footer.</p>`;
    });
});

// Helper per formattare la data in DD/MM
const formatDateDM = (date) => {
  const giorno = String(date.getDate()).padStart(2, "0");
  const mese = String(date.getMonth() + 1).padStart(2, "0");
  return `${giorno}/${mese}`;
};

// 🌐 HELPER: Compila TUTTE le date di chiusura per "ferie" (singole e a periodo) in un unico Set di DD/MM strings
function getUnifiedFerieDates(data, year) {
  const unifiedDates = new Set();
  const giorniExtraFerie =
    (data.giorniChiusuraExtra && data.giorniChiusuraExtra.ferie) || [];

  // 1. Aggiungi i giorni singoli extra ferie
  giorniExtraFerie.forEach((date) => unifiedDates.add(date));

  // Helper per creare oggetti Date da stringhe DD/MM
  const parseDate = (dateStr, y) => {
    const [day, month] = dateStr.split("/").map(Number);
    return new Date(y, month - 1, day, 0, 0, 0, 0);
  };

  // 2. Aggiungi i periodi lunghi di ferie
  const feriePeriods = data.ferie || [];
  for (const period of feriePeriods) {
    if (!period.inizio || !period.fine) continue;

    let dataInizio = parseDate(period.inizio, year);
    let dataFine = parseDate(period.fine, year);

    // Gestione ferie a cavallo d'anno
    if (dataInizio.getTime() > dataFine.getTime()) {
      dataFine = parseDate(period.fine, year + 1);
    }

    let currentDate = new Date(dataInizio);
    // Itera includendo la data di fine
    while (currentDate.getTime() <= dataFine.getTime()) {
      unifiedDates.add(formatDateDM(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return unifiedDates;
}

// 📅 HELPER: Trova l'ultimo giorno consecutivo chiuso per "ferie" partendo da una data, usando il set unificato
function findConsecutiveClosureEnd(startDate, unifiedFerieDates) {
  const startDateDM = formatDateDM(startDate);

  if (!unifiedFerieDates.has(startDateDM)) {
    return startDateDM;
  }

  let currentDate = new Date(startDate);
  let endDate = new Date(startDate);

  // Loop per trovare l'ultimo giorno consecutivo nel set unificato
  while (true) {
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateDM = formatDateDM(currentDate);

    // Se il giorno successivo NON è chiuso per ferie (né singole né lunghe), ci fermiamo.
    if (!unifiedFerieDates.has(nextDateDM)) {
      // La data di fine è l'ultima data chiusa trovata
      return formatDateDM(endDate);
    }

    // Se è chiuso, aggiorniamo la data di fine e continuiamo
    endDate = new Date(currentDate);
  }
}

// 🚨 FUNZIONE: Verifica lo stato di chiusura di un singolo giorno (Festività, Ferie Unificate, Motivi Extra)
function getSingleDayClosureReason(checkDate, data, unifiedFerieDates) {
  const festivita = data.festivita || [];
  const giorniExtra = data.giorniChiusuraExtra || {};

  const dateToCheck = new Date(checkDate);
  const dataFormattata = formatDateDM(dateToCheck);

  // 1. Check Festivita (Priority 1)
  if (festivita.includes(dataFormattata)) {
    return { reason: "festivita", dataChiusura: dataFormattata };
  }

  // 2. Check Ferie (Unificate) (Priority 2) - Copre periodi lunghi e giorni singoli
  if (unifiedFerieDates.has(dataFormattata)) {
    // Calcola la data di fine del blocco consecutivo unificato
    const fineChiusura = findConsecutiveClosureEnd(
      dateToCheck,
      unifiedFerieDates
    );
    return {
      reason: "ferie",
      dataChiusura: fineChiusura,
    };
  }

  // 3. Check Motivi Extra (altri giorni singoli) (Priority 3)
  for (const reason in giorniExtra) {
    // Ignora la ragione "ferie" perché è già coperta dal check unificato (Punto 2)
    if (
      reason !== "ferie" &&
      Array.isArray(giorniExtra[reason]) &&
      giorniExtra[reason].includes(dataFormattata)
    ) {
      return {
        reason: reason,
        dataChiusura: dataFormattata,
      };
    }
  }

  return null;
}

// --- Funzione Principale di Generazione HTML ---
function createFooterHTML(data) {
  const info = data.info || {};
  const contatti = data.contatti || {};
  const orari = data.orari || [];
  const social = data.social || {};
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  const mapsQuery = contatti.indirizzo
    ? encodeURIComponent(contatti.indirizzo)
    : "";
  const googleMapsUrl = `http://googleusercontent.com/maps.google.com/8${mapsQuery}`;

  // --- LOGICA ORARI (Solo per lo stato di OGGI in tempo reale) ---
  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0); // Normalizza oggi per i calcoli della data

  const giornoSettimana = oggiReal.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();

  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1; // 0=Lun, ..., 6=Dom (Indice array orari di oggi)

  // Calcola il set unificato di date di ferie all'inizio
  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());

  // Calcolo stati di chiusura OGGI
  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates
  );
  const isFestivita =
    singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra =
    singleDayClosure && singleDayClosure.reason === "morivi-extra";

  // Se almeno una condizione di chiusura è vera
  const eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

  function checkApertura(orariString) {
    if (eChiusoOggi) return false;

    if (!orariString || orariString.toLowerCase().includes("chiuso"))
      return false;

    const orariMatch = orariString.match(
      /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g
    );
    if (!orariMatch) return false;

    const parseTime = (timeStr) => {
      const [ore, minuti] = timeStr.split(":");
      return parseInt(ore, 10) * 100 + parseInt(minuti, 10);
    };

    return orariMatch.some((intervallo) => {
      const [inizio, fine] = intervallo.split("-").map((t) => t.trim());
      return oraCorrente >= parseTime(inizio) && oraCorrente < parseTime(fine);
    });
  }

  const statoApertura = checkApertura(orari[indiceGiornoCorrente]);

  // --- LOGICA DI CALCOLO DATE ROLLING (7 giorni da oggi) ---
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

      // Calcola l'indice corretto per l'array 'orari' fisso (0=Lun, 6=Dom)
      let dayOfWeek = dataDelGiorno.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
      let orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      let line = orari[orariIndex]; // Orario base del giorno della settimana
      let testoOrario = line;
      const nomeGiorno = line.split(":")[0]; // e.g., "Lunedì"

      // Ricalcolo stati di chiusura per il giorno in analisi
      const closureCheck = getSingleDayClosureReason(
        dataDelGiorno,
        data,
        unifiedFerieDates
      );

      // 1. PRIORITÀ: Festività (Singolo Giorno)
      if (closureCheck && closureCheck.reason === "festivita") {
        testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
      }
      // 2. PRIORITÀ: Ferie (Singoli/Multipli e unificati)
      else if (closureCheck && closureCheck.reason === "ferie") {
        testoOrario = `${nomeGiorno}: Chiuso (Ferie fino al ${closureCheck.dataChiusura})`;
      }
      // 3. PRIORITÀ: Motivi Extra
      else if (closureCheck && closureCheck.reason === "morivi-extra") {
        testoOrario = `${nomeGiorno}: Chiuso (Motivi Extra)`;
      }
      // 4. Altrimenti, mostra l'orario normale (testoOrario = line)

      // 5. STYLE CHECK: Applicazione dello stile SOLO al giorno corrente (i === 0).
      if (i === 0) {
        peso = "font-weight:bold;";

        // Colora in base allo stato in tempo reale di OGGI
        if (eChiusoOggi || !statoApertura) {
          colore = legenda.colori.chiuso || "orange";
        } else {
          colore = legenda.colori.aperto || "#00FF7F";
        }
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${testoOrario}</li>`;
    })
    .join("");

  const legendaHtml = `
  <div class="legenda-orari" style="margin-top: 10px;">
    
    <div style="margin-bottom: 10px;">
      <span style="color: white; font-weight: bold; font-size: 1.2em;">
        <br>
        ${legenda.titolo || "Legenda Orari"}
      </span>
    </div>

    <div style="display: flex; align-items: center; margin-bottom: 5px;">
      <span 
        style="
          height: 12px; 
          width: 12px; 
          background-color: ${legenda.colori.aperto || "#00FF7F"}; 
          margin-right: 8px; 
          border-radius: 50%;
          display: inline-block;
        ">
      </span>
      <span style="color: white;">${legenda.testo.aperto || "Aperto"}</span>
    </div>

    <div style="display: flex; align-items: center;">
      <span 
        style="
          height: 12px; 
          width: 12px; 
          background-color: ${legenda.colori.chiuso || "orange"}; 
          margin-right: 8px; 
          border-radius: 50%;
          display: inline-block;
        ">
      </span>
      <span style="color: white;">${
        legenda.testo.chiuso || "In chiusura / Chiuso"
      }</span>
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
                    ${
                      contatti.telefono
                        ? `
                    <li class="footer-item">
                        <span class="material-icons">phone</span>
                        <a href="tel:${contatti.telefono}">${contatti.telefono}</a>
                    </li>`
                        : ""
                    }
                    ${
                      contatti.email
                        ? `
                    <li class="footer-item">
                        <span class="material-icons">email</span>
                        <a href="mailto:${contatti.email}">${contatti.email}</a>
                    </li>`
                        : ""
                    }
                    ${
                      contatti.indirizzo
                        ? `
                    <li class="footer-item">
                        <span class="material-icons">location_on</span>
                        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">${contatti.indirizzo}</a>
                    </li>`
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
                    ${
                      social.facebook
                        ? `
                    <a href="${social.facebook}" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" style="width: 24px; height: 24px;"/>
                    </a>`
                        : ""
                    }
                    ${
                      social.instagram
                        ? `
                    <a href="${social.instagram}" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram" style="width: 24px; height: 24px;"/>
                    </a>`
                        : ""
                    }
                    ${
                      social.whatsapp
                        ? `
                    <a href="${social.whatsapp}" class="social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png" alt="WhatsApp" style="width: 24px; height: 24px;"/>
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
        <p>© ${new Date().getFullYear()} Macelleria da Ketti. Tutti i diritti riservati.
        ${info.p_iva ? ` - P.IVA: ${info.p_iva}` : ""}
        </p>
    </div>
  `;
}

// 🔄 FUNZIONE DI AUTO-AGGIORNAMENTO COLORI ORARI

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

  // Calcola il set unificato di date di ferie all'inizio
  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());

  // Verifica stato OGGI
  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates
  );
  const isFestivita =
    singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra =
    singleDayClosure && singleDayClosure.reason === "morivi-extra";

  const eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

  function checkApertura(orariString) {
    if (eChiusoOggi) return false;

    if (!orariString || orariString.toLowerCase().includes("chiuso"))
      return false;

    const orariMatch = orariString.match(
      /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g
    );
    if (!orariMatch) return false;

    const parseTime = (t) => {
      const [ore, minuti] = t.split(":");
      return parseInt(ore) * 100 + parseInt(minuti);
    };

    return orariMatch.some((range) => {
      const [inizio, fine] = range.split("-").map((s) => s.trim());
      return oraCorrente >= parseTime(inizio) && oraCorrente < parseTime(fine);
    });
  }

  const statoApertura = checkApertura(orari[indiceGiornoCorrente]);

  // --- LOGICA DI CALCOLO DATE ROLLING (7 giorni da oggi) ---
  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const dataDelGiorno = new Date(oggi);
    dataDelGiorno.setDate(oggi.getDate() + i);
    dataDelGiorno.setHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(dataDelGiorno);
  }

  // --- RISCRIVE L'ELENCO ORARI (aggiornamento reale) ---
  const lista = document.querySelector("#orari-footer");
  if (!lista) return;

  lista.innerHTML = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";

      // Calcola l'indice corretto per l'array 'orari' fisso (0=Lun, 6=Dom)
      let dayOfWeek = dataDelGiorno.getDay();
      let orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      let line = orari[orariIndex];
      let testoOrario = line;
      const nomeGiorno = line.split(":")[0];

      // Ricalcolo stati di chiusura per il giorno in analisi
      const closureCheck = getSingleDayClosureReason(
        dataDelGiorno,
        data,
        unifiedFerieDates
      );

      // 1. PRIORITÀ: Festività (Singolo Giorno)
      if (closureCheck && closureCheck.reason === "festivita") {
        testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
      }
      // 2. PRIORITÀ: Ferie (Singoli/Multipli e unificati)
      else if (closureCheck && closureCheck.reason === "ferie") {
        testoOrario = `${nomeGiorno}: Chiuso (Ferie fino al ${closureCheck.dataChiusura})`;
      }
      // 3. PRIORITÀ: Motivi Extra
      else if (closureCheck && closureCheck.reason === "morivi-extra") {
        testoOrario = `${nomeGiorno}: Chiuso (Motivi Extra)`;
      }

      // 4. STYLE CHECK: Applicazione dello stile SOLO al giorno corrente (i === 0).
      if (i === 0) {
        peso = "font-weight:bold;";

        if (eChiusoOggi || !statoApertura) {
          colore = legenda.colori.chiuso || "orange";
        } else {
          colore = legenda.colori.aperto || "#00FF7F";
        }
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${testoOrario}</li>`;
    })
    .join("");
}

// MAPPA
function initMap(lat, lon) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

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
}
