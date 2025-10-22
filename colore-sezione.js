// Active section highlighting on scroll
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer[id]")
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link")
  const headerOffset = 80; // Offset to account for the sticky header, matching scroll-padding-top in styles.css

  function highlightNavigation() {
    const scrollY = window.pageYOffset;
    let bestMatch = { id: "Home", visibleRatio: 0 }; // Inizia con Home come predefinito

    // Itera attraverso le sezioni per trovare quella più visibile
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calcola quanto della sezione è visibile
      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / rect.height;

      // Se questa sezione è più visibile della migliore trovata finora, la aggiorniamo
      if (visibleRatio > bestMatch.visibleRatio) {
        bestMatch = { id: section.getAttribute("id"), visibleRatio: visibleRatio };
      }
    });

    let currentSectionId = bestMatch.id;

    // Caso speciale per la fine della pagina: se siamo quasi alla fine, forza l'evidenziazione di "Contatti".
    if ((window.innerHeight + scrollY) >= (document.body.offsetHeight - 5)) {
      currentSectionId = "Contatti";
    }

    // Aggiorna la classe 'active' sui link di navigazione
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      const cleanLinkHref = linkHref.substring(1); // Rimuove '#' per il confronto

      if (cleanLinkHref === currentSectionId) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })
  }

  window.addEventListener("scroll", highlightNavigation)
  highlightNavigation() // Chiama la funzione al caricamento per impostare lo stato iniziale
})
