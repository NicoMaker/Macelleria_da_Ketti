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

      // Usa setTimeout per assicurarsi che il DOM sia completamente aggiornato
      // prima di inizializzare la mappa e notificare gli altri script.
      setTimeout(() => {
        // Initialize map using coordinates from footer.json
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }
        // Notifica gli altri script che il footer è stato caricato
        document.dispatchEvent(new CustomEvent('footerLoaded'));
      }, 100); // Un piccolo ritardo è sufficiente
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

  const mapsQuery = contatti.indirizzo ? encodeURIComponent(contatti.indirizzo) : '';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // --- LOGICA ORARI ---
  const oggi = new Date();
  const giornoSettimana = oggi.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  const oraCorrente = oggi.getHours() * 100 + oggi.getMinutes();

  let indiceGiornoCorrente = -1;
  if (giornoSettimana >= 1 && giornoSettimana <= 5) { // Lun-Ven
    indiceGiornoCorrente = 0;
  } else if (giornoSettimana === 6) { // Sabato
    indiceGiornoCorrente = 1;
  } else { // Domenica
    indiceGiornoCorrente = 2;
  }

  /**
   * Controlla se il negozio è aperto in base alla stringa degli orari.
   * @param {string} orariString La stringa degli orari per il giorno corrente (es. "8:00 - 13:00 / 16:00 - 19:30").
   * @returns {boolean} True se il negozio è aperto, altrimenti false.
   */
  function checkApertura(orariString) {
    if (!orariString || orariString.toLowerCase().includes('chiuso')) {
      return false;
    }

    // Estrae solo gli orari (es. "8:00 - 13:00 / 16:00 - 19:30")
    const orariMatch = orariString.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g);
    if (!orariMatch) {
      return false;
    }

    // Funzione per convertire "HH:MM" in un numero (es. "8:00" -> 800)
    const parseTime = (timeStr) => {
      const [ore, minuti] = timeStr.split(':');
      return parseInt(ore, 10) * 100 + parseInt(minuti, 10);
    };

    // Controlla ogni intervallo di tempo
    return orariMatch.some(intervallo => {
      const [inizio, fine] = intervallo.split('-').map(t => t.trim());
      return oraCorrente >= parseTime(inizio) && oraCorrente < parseTime(fine);
    });
  }

  const statoApertura = checkApertura(orari[indiceGiornoCorrente]);

  const orariHtml = orari.map((line, index) => {
    let stile = '';
    if (index === indiceGiornoCorrente) {
      // Applica lo stile direttamente: verde se aperto, rosso se chiuso.
      const colore = statoApertura ? '#00FF7F' : '#FF4B4B'; // Rosso più vibrante per massimo contrasto
      stile = `style="color: ${colore}; font-weight: bold;"`;
    }
    // Aggiunge l'attributo 'style' solo se necessario.
    return `<li class="footer-item" ${stile}>${line}</li>`;
  }).join('');

  return `
    <div class="footer-content">
        <div class="footer-grid">
            <div class="footer-section">
                <h3 class="footer-title">${info.titolo || ''}</h3>
                <p class="footer-text">${info.testo || ''}</p>
            </div>
            
            <div class="footer-section">
                <h4 class="footer-subtitle">Contatti</h4>
                <ul class="footer-list">
                    ${contatti.telefono ? `
                    <li class="footer-item">
                        <span class="material-icons">phone</span>
                        <a href="tel:${contatti.telefono}">${contatti.telefono}</a>
                    </li>` : ''}
                    ${contatti.email ? `
                    <li class="footer-item">
                        <span class="material-icons">email</span>
                        <a href="mailto:${contatti.email}">${contatti.email}</a>
                    </li>` : ''}
                    ${contatti.indirizzo ? `
                    <li class="footer-item">
                        <span class="material-icons">location_on</span>
                        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">${contatti.indirizzo}</a>
                    </li>` : ''}
                </ul>
            </div>

            <div class="footer-section">
                <h4 class="footer-subtitle">Orari</h4>
                <ul id="orari-footer" class="footer-list">
                    ${orariHtml}
                </ul>
            </div>

            <div class="footer-section">
                <h4 class="footer-subtitle">Seguici</h4>
                <div class="social-links">
                    ${social.facebook ? `
                    <a href="${social.facebook}" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" style="width: 24px; height: 24px;"/>
                    </a>` : ''}
                    ${social.instagram ? `
                    <a href="${social.instagram}" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram" style="width: 24px; height: 24px;"/>
                    </a>` : ''}
                    ${social.whatsapp ? `
                    <a href="${social.whatsapp}" class="social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png" alt="WhatsApp" style="width: 24px; height: 24px;"/>
                    </a>` : ''}
                </div>
            </div>
        </div>

        <div class="footer-map">
            <div id="map"></div>
        </div>
    </div>

    <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Macelleria da Ketti. Tutti i diritti riservati.
        ${info.p_iva ? ` - P.IVA: ${info.p_iva}` : ''}
        </p>
    </div>
  `;
}

function initMap(lat, lon) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // Create iframe for OpenStreetMap
  const iframe = document.createElement("iframe");
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";
  iframe.style.border = "none";
  const zoomLevel = 0.0005; // Valore ancora più piccolo per uno zoom massimo
  iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - zoomLevel},${lat - zoomLevel},${lon + zoomLevel},${lat + zoomLevel}&layer=mapnik&marker=${lat},${lon}`;
  iframe.loading = "lazy";

  mapContainer.appendChild(iframe);
}
