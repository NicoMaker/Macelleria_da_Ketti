// Footer dynamic content and map initialization
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("Contatti");
  if (!footer) return;

  // Load footer data
  fetch("footer.json")
    .then((response) => response.json())
    .then((data) => {
      footer.innerHTML = createFooterHTML(data);

      // Initialize map using coordinates from footer.json
      if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
        initMap(data.mappa.latitudine, data.mappa.longitudine);
      }
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

  const orariHtml = orari.map(line => `<li class="footer-item">${line}</li>`).join('');

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
                <ul class="footer-list">
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
        <p>&copy; ${new Date().getFullYear()} Macelleria da Ketti. Tutti i diritti riservati.</p>
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
  const zoomLevel = 0.003; // Valore più piccolo per uno zoom maggiore
  iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - zoomLevel},${lat - zoomLevel},${lon + zoomLevel},${lat + zoomLevel}&layer=mapnik&marker=${lat},${lon}`;
  iframe.loading = "lazy";

  mapContainer.appendChild(iframe);
}
