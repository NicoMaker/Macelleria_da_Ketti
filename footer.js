// Footer dynamic content and map initialization
document.addEventListener("DOMContentLoaded", () => {
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
          indirizzoEl.textContent = data.contatti.indirizzo
        }
      }

      // Initialize map
      if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
        initMap(data.mappa.latitudine, data.mappa.longitudine)
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
  iframe.scrolling = "no"
  iframe.marginHeight = "0"
  iframe.marginWidth = "0"
  iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`
  iframe.style.border = "none"

  mapContainer.appendChild(iframe)
}
