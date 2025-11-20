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

function createFooterHTML(data) {
  const info = data.info || {};
  const contatti = data.contatti || {};
  const orari = data.orari || [];
  const social = data.social || {};
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  const mapsQuery = contatti.indirizzo ? encodeURIComponent(contatti.indirizzo) : '';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // --- LOGICA ORARI ---
  const oggi = new Date();
  const giornoSettimana = oggi.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab

  const oraCorrente = oggi.getHours() * 100 + oggi.getMinutes();

  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  function checkApertura(orariString) {
    if (!orariString || orariString.toLowerCase().includes('chiuso')) {
      return false;
    }

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

  const orariHtml = orari
    .map((line, index) => {
      let colore = "";
      let peso = "";

      if (index === indiceGiornoCorrente) {
        colore = statoApertura ? (legenda.colori.aperto || "#00FF7F") : (legenda.colori.chiuso || "orange");
        peso = "font-weight:bold;";
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${line}</li>`;
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
        <p>&copy; ${new Date().getFullYear()} Macelleria da Ketti. Tutti i diritti riservati.
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

  const oggi = new Date();
  const giornoSettimana = oggi.getDay();
  const oraCorrente = oggi.getHours() * 100 + oggi.getMinutes();

  let indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  function checkApertura(orariString) {
    if (!orariString || orariString.toLowerCase().includes("chiuso")) {
      return false;
    }

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

  // --- RISCRIVE L’ELENCO ORARI (aggiornamento reale) ---
  const lista = document.querySelector("#orari-footer");
  if (!lista) return;

  lista.innerHTML = orari
    .map((line, index) => {
      let colore = "";
      let peso = "";

      if (index === indiceGiornoCorrente) {
        colore = statoApertura ? (legenda.colori.aperto || "#00FF7F") : (legenda.colori.chiuso || "orange");
        peso = "font-weight:bold;";
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${line}</li>`;
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