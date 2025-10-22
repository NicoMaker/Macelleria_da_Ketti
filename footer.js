// Footer dynamic content and map initialization
document.addEventListener("DOMContentLoaded", () => {
  // Update copyright year
  const yearSpan = document.getElementById("copyright-year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Load footer data
  fetch("footer.json")
    .then((response) => response.json())
    .then((data) => {
      // Update contact information
      if (data.contatti) {
        const telefonoEl = document.getElementById("footer-telefono")
        const emailEl = document.getElementById("footer-email")
        const indirizzoEl = document.getElementById("footer-indirizzo")

        if (telefonoEl && data.contatti.telefono) {
          telefonoEl.textContent = data.contatti.telefono
        }
        if (emailEl && data.contatti.email) {
          emailEl.textContent = data.contatti.email
        }
        if (indirizzoEl && data.contatti.indirizzo) {
          indirizzoEl.textContent = data.contatti.indirizzo;
          const mapsQuery = encodeURIComponent(data.contatti.indirizzo);
          indirizzoEl.href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

        }
      }

      // Initialize map using coordinates from footer.json
      if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
        initMap(data.mappa.latitudine, data.mappa.longitudine);
      }
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del footer:", error)
    })
})

function initMap(lat, lon) {
  const mapContainer = document.getElementById("map")
  if (!mapContainer) return

  // Create iframe for OpenStreetMap
  const iframe = document.createElement("iframe")
  iframe.width = "100%"
  iframe.height = "100%"
  iframe.frameBorder = "0"
  iframe.style.border = "none"
  const zoomLevel = 0.003; // Valore più piccolo per uno zoom maggiore
  iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - zoomLevel},${lat - zoomLevel},${lon + zoomLevel},${lat + zoomLevel}&layer=mapnik&marker=${lat},${lon}`
  iframe.loading = "lazy";

  mapContainer.appendChild(iframe)
}
