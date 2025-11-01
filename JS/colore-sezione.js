// Active section highlighting on scroll
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  const baseTitle = "Macelleria da Ketti - Carne di Qualità dal 1985";
  
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
    });

    // Aggiorna l'hash nell'URL senza aggiungere alla cronologia
    // e solo se è cambiato per evitare chiamate non necessarie.
    const currentHash = window.location.hash.substring(1);
    if (currentSectionId && currentHash !== currentSectionId) {
      history.replaceState(null, null, '#' + currentSectionId);
    }

    // Aggiorna il titolo della pagina
    const sectionElement = document.getElementById(currentSectionId);
    const sectionName = sectionElement.dataset.sectionName || currentSectionId.charAt(0).toUpperCase() + currentSectionId.slice(1);
    if (currentSectionId.toLowerCase() === 'home') {
      document.title = baseTitle;
    } else {
      document.title = `${sectionName} - Macelleria da Ketti`;
    }
  }

  // Funzione di inizializzazione per lo script di highlighting.
  function initializeHighlighting() {
    window.addEventListener("scroll", highlightNavigation);
    highlightNavigation(); // Imposta lo stato iniziale corretto.
  }

  // Controlla se l'URL contiene un hash (es. #Prodotti).
  // Se sì, ritarda l'inizializzazione per permettere al browser di scorrere alla sezione.
  if (window.location.hash) {
    setTimeout(initializeHighlighting, 150); // Un piccolo ritardo è sufficiente.
  } else {
    // Se non c'è un hash, inizializza subito.
    initializeHighlighting();
  }
});
