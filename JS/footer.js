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
        document.dispatchEvent(new CustomEvent('footerLoaded'));

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

// 🎄 FUNZIONE GENERICA PER VERIFICARE SE UNA DATA È FESTIVITÀ
function isDateFestivita(checkDate, festivita) {
  if (!festivita || !Array.isArray(festivita)) return false;
  
  const dateToCheck = new Date(checkDate);
  const giorno = String(dateToCheck.getDate()).padStart(2, '0');
  const mese = String(dateToCheck.getMonth() + 1).padStart(2, '0');
  const dataFormattata = `${giorno}/${mese}`;
  
  return festivita.includes(dataFormattata);
}

// 🏖️ FUNZIONE GENERICA PER VERIFICARE SE UNA DATA È PERIODO DI FERIE
function isDateInFeriePeriod(originalCheckDate, ferie) {
    if (!ferie || !ferie.inizio || !ferie.fine) return false;
    
    // Clona e normalizza la data da controllare all'inizio del giorno
    const checkDate = new Date(originalCheckDate); 
    checkDate.setHours(0, 0, 0, 0); 

    const parseDate = (dateStr, year) => {
        const [day, month] = dateStr.split('/').map(Number);
        // Imposta l'ora a 00:00:00 per confronti precisi
        return new Date(year, month - 1, day, 0, 0, 0, 0); 
    };
    
    const currentYear = checkDate.getFullYear();

    let dataInizio = parseDate(ferie.inizio, currentYear);
    let dataFine = parseDate(ferie.fine, currentYear);

    // Gestione ferie a cavallo d'anno (es. 20/12 - 05/01)
    if (dataFine.getTime() < dataInizio.getTime()) {
        const dataInizioReal = parseDate(ferie.inizio, currentYear);
        const dataFineReal = parseDate(ferie.fine, currentYear);

        if (checkDate.getMonth() >= dataInizioReal.getMonth()) {
            // Data di controllo nella parte finale dell'anno
            return checkDate.getTime() >= dataInizioReal.getTime();
        } else {
             // Data di controllo nella parte iniziale dell'anno
            return checkDate.getTime() <= dataFineReal.getTime();
        }
    }
    
    // Ferie normali nello stesso anno (Inclusa la data di fine)
    return checkDate.getTime() >= dataInizio.getTime() && checkDate.getTime() <= dataFine.getTime();
}

// --- Funzione Principale di Generazione HTML ---
function createFooterHTML(data) {
  const info = data.info || {};
  const contatti = data.contatti || {};
  const orari = data.orari || [];
  const social = data.social || {};
  const legenda = data.legendaOrari || { colori: {}, testo: {} };
  const festivita = data.festivita || [];
  const ferie = data.ferie || null;

  const mapsQuery = contatti.indirizzo ? encodeURIComponent(contatti.indirizzo) : '';
  const googleMapsUrl = `http://googleusercontent.com/maps.google.com/8{mapsQuery}`;

  // --- LOGICA ORARI ---
  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0); // Normalizza oggi per i calcoli della data

  const giornoSettimana = oggiReal.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();

  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1; // 0=Lun, ..., 6=Dom (Indice array orari di oggi)

  // Verifica stato OGGI
  const eFestivitaOggi = isDateFestivita(oggiReal, festivita);
  const eFerieOggi = isDateInFeriePeriod(oggiReal, ferie); 
  const eChiusoOggi = eFestivitaOggi || eFerieOggi; // Se almeno una è vera, è chiuso.

  function checkApertura(orariString) {
    if (eChiusoOggi) return false;

    if (!orariString || orariString.toLowerCase().includes('chiuso')) return false;
    
    const orariMatch = orariString.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g);
    if (!orariMatch) return false;

    const parseTime = (timeStr) => {
      const [ore, minuti] = timeStr.split(':');
      return parseInt(ore, 10) * 100 + parseInt(minuti, 10);
    };

    return orariMatch.some(intervallo => {
      const [inizio, fine] = intervallo.split('-').map((t) => t.trim());
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
    .map((dataDelGiorno, i) => { // i è l'offset dal giorno corrente (0=Oggi, 1=Domani, ...)
      let colore = "";
      let peso = "";
      
      // Calcola l'indice corretto per l'array 'orari' fisso (0=Lun, 6=Dom)
      let dayOfWeek = dataDelGiorno.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
      let orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      let line = orari[orariIndex]; // Orario base del giorno della settimana
      let testoOrario = line;
      const nomeGiorno = line.split(':')[0]; // e.g., "Lunedì"
      
      const giornoIsFerie = ferie && isDateInFeriePeriod(dataDelGiorno, ferie);
      const giornoIsFestivita = isDateFestivita(dataDelGiorno, festivita);

      
      // 1. PRIORITÀ: Se è Festività, mostra "Chiuso (Festività)"
      if (giornoIsFestivita) {
         testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
      }
      // 2. Altrimenti, se è in Ferie, mostra "Chiuso per ferie..."
      else if (giornoIsFerie) {
        testoOrario = `${nomeGiorno}: Chiuso per ferie fino al ${ferie.fine}`;
      }
      // 3. Altrimenti, mostra l'orario normale (testoOrario = line)


      // 4. STYLE CHECK: Applicazione dello stile SOLO al giorno corrente (i === 0).
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
    <div class="legenda-orari" style="font-size: 0.8em; margin-top: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="height: 10px; width: 10px; background-color: ${legenda.colori.aperto || '#00FF7F'}; margin-right: 8px; border-radius: 50%;"></span>
            <span>${legenda.testo.aperto || 'Aperto'}</span>
        </div>
        <div style="display: flex; align-items: center;">
            <span style="height: 10px; width: 10px; background-color: ${legenda.colori.chiuso || 'orange'}; margin-right: 8px; border-radius: 50%;"></span>
            <span>${legenda.testo.chiuso || 'In chiusura / Chiuso'}</span>
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
                    </li>`
      : ""
    }
                    ${contatti.email
      ? `
                    <li class="footer-item">
                        <span class="material-icons">email</span>
                        <a href="mailto:${contatti.email}">${contatti.email}</a>
                    </li>`
      : ""
    }
                    ${contatti.indirizzo
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
                    ${social.facebook
      ? `
                    <a href="${social.facebook}" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" style="width: 24px; height: 24px;"/>
                    </a>`
      : ""
    }
                    ${social.instagram
      ? `
                    <a href="${social.instagram}" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram" style="width: 24px; height: 24px;"/>
                    </a>`
      : ""
    }
                    ${social.whatsapp
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
  const festivita = data.festivita || [];
  const ferie = data.ferie || null;
  if (!orari.length) return;

  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0); 
  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes(); 

  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  // Verifica stato OGGI
  const eFestivitaOggi = isDateFestivita(oggiReal, festivita);
  const eFerieOggi = isDateInFeriePeriod(oggiReal, ferie); 
  const eChiusoOggi = eFestivitaOggi || eFerieOggi; // Se almeno una è vera, è chiuso.

  function checkApertura(orariString) {
    if (eChiusoOggi) return false;

    if (!orariString || orariString.toLowerCase().includes("chiuso")) return false;
    
    const orariMatch = orariString.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g);
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
      const nomeGiorno = line.split(':')[0];
      
      const giornoIsFerie = ferie && isDateInFeriePeriod(dataDelGiorno, ferie);
      const giornoIsFestivita = isDateFestivita(dataDelGiorno, festivita);

      // 1. PRIORITÀ: Se è Festività, mostra "Chiuso (Festività)"
      if (giornoIsFestivita) {
         testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
      }
      // 2. Altrimenti, se è in Ferie, mostra "Chiuso per ferie..."
      else if (giornoIsFerie) {
        testoOrario = `${nomeGiorno}: Chiuso per ferie fino al ${ferie.fine}`;
      }
      
      // 3. STYLE CHECK: Applicazione dello stile SOLO al giorno corrente (i === 0).
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
  iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - zoomLevel},${lat - zoomLevel},${lon + zoomLevel},${lat + zoomLevel}&layer=mapnik&marker=${lat},${lon}`;
  iframe.loading = "lazy";

  mapContainer.appendChild(iframe);
}