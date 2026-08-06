// ============================================================
// footer-mappa.js — Gestione mappa OpenStreetMap
// ============================================================

let currentMapCoordinates = null;

function initMap(lat, lon) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // Verifica se le coordinate sono cambiate
  const newCoordinates = `${lat},${lon}`;
  if (currentMapCoordinates === newCoordinates) {
    console.log("Coordinate invariate - mappa non ricaricata");
    return;
  }

  // Aggiorna le coordinate correnti
  currentMapCoordinates = newCoordinates;

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
