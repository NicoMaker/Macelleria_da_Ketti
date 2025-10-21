const createListItem = (href, imgSrc, altText, text) => `
  <li>
    <button>
      ${href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : ""}
        <img src="${imgSrc}" alt="${altText}"> ${text}
      ${href ? "</a>" : ""}
    </button>
  </li>
`;

const loadFooterData = async () => {
  try {
    const response = await fetch("JS/Footer.json");

    // Verifica che la risposta sia corretta
    if (!response.ok) throw new Error("Errore nel caricamento del file JSON");

    const data = await response.json();

    const createListSection = (items) =>
      items
        .map((item) =>
          createListItem(item.href, item.imgSrc, item.altText, item.text),
        )
        .join("");

    const contactList = createListSection(data.contacts);
    const socialList = createListSection(data.socials);

    // Create map section with OpenStreetMap
    const mapSection = `
      <div class="map-section">
        <h3 class="map-title">Dove Siamo</h3>
        <p>${data.location.address}</p>
        <div id="map-container"></div>
        <a href="${data.location.mapLink}" target="_blank" rel="noopener noreferrer" class="map-link">
          <span class="material-icons">directions</span> Visualizza su Google Maps
        </a>
      </div>
    `;

    // Genera il footer completo
    document.getElementById("footer").innerHTML = `
      <footer>
        <div class="footer-container">
          ${mapSection}
          <div class="footer-columns">
            <div class="contact-section">
              <br>
              <h3 class="section-title">Contatti</h3>
              <ul class="contact-list">${contactList}</ul>
            </div>
            <div class="social-section">
              <br>
              <h3 class="section-title">Seguici sui Social</h3>
              <ul class="social-list">${socialList}</ul>
            </div>
          </div>
        </div>
        <p class="copyright">&copy; ${new Date().getFullYear()} Macelleria da Ketti. Tutti i diritti riservati.</p>
      </footer>
    `;

    // Initialize the map after the footer is loaded
    initializeMap(data.location);

    // Aggiungi animazione al footer quando è visibile
    const footer = document.querySelector("footer");
    const checkFooterVisibility = () => {
      const footerTop = footer.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (footerTop < windowHeight * 0.9) {
        footer.classList.add("visible");
      }
    };

    window.addEventListener("scroll", checkFooterVisibility);
    checkFooterVisibility(); // Controlla all'avvio
  } catch (error) {
    console.error("Errore nel caricare i dati del footer:", error);
  }
};

// Initialize OpenStreetMap
function initializeMap(location) {
  // Check if Leaflet is already loaded
  if (typeof L !== "undefined") {
    // Extract coordinates from the Google Maps URL or use default coordinates
    // This is a simple extraction and might need adjustment based on the actual URL format
    const defaultLat = 45.9852;
    const defaultLng = 12.7866;

    // Create the map
    const map = L.map("map-container").setView([defaultLat, defaultLng], 15);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a marker with custom icon
    const customIcon = L.icon({
      iconUrl:
        "https://th.bing.com/th/id/R.1d252dd04867c63c8d587285edfadc8f?rik=EQUSnR3e1idlhA&pid=ImgRaw&r=0",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const marker = L.marker([defaultLat, defaultLng], {
      icon: customIcon,
    }).addTo(map);
    marker
      .bindPopup(
        `
      <div class="map-popup">
        <strong>IdeaLegno</strong><br>
        ${location.address}<br>
        <a href="${location.mapLink}" target="_blank">Indicazioni</a>
      </div>
    `,
      )
      .openPopup();

    // Add click event to open Google Maps
    map.on("click", () => {
      window.open(location.mapLink, "_blank");
    });

    // Aggiungi animazione alla mappa
    const mapContainer = document.getElementById("map-container");
    mapContainer.classList.add("fade-in");
  } else {
    console.error(
      "Leaflet library is not loaded. Please include it in your HTML.",
    );

    // Fallback for when Leaflet is not available
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#f0f0f0;color:#333;text-align:center;padding:20px;">
          <p>Mappa non disponibile. <a href="${location.mapLink}" target="_blank" style="color:#8b5a2b;font-weight:bold;">Visualizza su Google Maps</a></p>
        </div>
      `;
    }
  }
}

const defaultLat = 45.9718974;
const defaultLng = 12.7988965;

// Initialize OpenStreetMap
function initializeMap(location) {
  if (typeof L !== "undefined") {
    // ✅ Coordinate aggiornate
    const defaultLat = 45.9718974;
    const defaultLng = 12.7988965;

    const map = L.map("map-container").setView([defaultLat, defaultLng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl:
        "https://th.bing.com/th/id/R.1d252dd04867c63c8d587285edfadc8f?rik=EQUSnR3e1idlhA&pid=ImgRaw&r=0",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const marker = L.marker([defaultLat, defaultLng], {
      icon: customIcon,
    }).addTo(map);

    marker
      .bindPopup(
        `
      <div class="map-popup">
        <strong>IdeaLegno</strong><br>
        ${location.address}<br>
        <a href="${location.mapLink}" target="_blank">Indicazioni</a>
      </div>
    `,
      )
      .openPopup();

    map.on("click", () => {
      window.open(location.mapLink, "_blank");
    });

    document.getElementById("map-container").classList.add("fade-in");
  } else {
    console.error(
      "Leaflet library is not loaded. Please include it in your HTML.",
    );

    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#f0f0f0;color:#333;text-align:center;padding:20px;">
          <p>Mappa non disponibile. <a href="${location.mapLink}" target="_blank" style="color:#8b5a2b;font-weight:bold;">Visualizza su Google Maps</a></p>
        </div>
      `;
    }
  }
}

// Inizializza il footer quando il DOM è pronto
document.addEventListener("DOMContentLoaded", loadFooterData);
