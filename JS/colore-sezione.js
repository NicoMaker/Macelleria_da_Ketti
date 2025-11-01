// Active section highlighting on scroll
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer#Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  
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

    // Caso speciale per la fine della pagina: se il footer è visibile nella parte inferiore
    // della finestra, forza l'evidenziazione di "Contatti".
    const footer = document.getElementById('Contatti');
    if (footer && footer.getBoundingClientRect().top <= window.innerHeight) {
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

    // Aggiorna l'hash nell'URL senza aggiungere alla cronologia di navigazione.
    const currentHash = window.location.hash;
    const newHash = `#${currentSectionId}`;
    
    if (currentHash !== newHash) {
      // Usiamo un try-catch perché in alcuni contesti (es. iframe) potrebbe fallire
      try {
        history.replaceState(null, null, newHash);
      } catch (e) { console.error("Impossibile aggiornare l'hash dell'URL:", e); }
    }
  }

  // Funzione di inizializzazione per lo script di highlighting.
  function initializeHighlighting() {
    window.addEventListener("scroll", highlightNavigation);
    highlightNavigation(); // Imposta lo stato iniziale corretto al primo caricamento.
  }

  // Gestione del caricamento iniziale.
  if (window.location.hash) {
    // Se c'è un hash, il browser tenterà di scorrere. Diamo un piccolo ritardo
    // all'inizializzazione per assicurarci che lo scroll sia completato.
    setTimeout(() => {
      initializeHighlighting();
      // Se l'hash è #Contatti, forziamo un ricalcolo immediato per essere sicuri
      // che la sezione corretta sia evidenziata, specialmente al refresh.
      if (window.location.hash === '#Contatti') {
        highlightNavigation();
      }
    }, 150); // Aumentato leggermente il ritardo per maggiore stabilità
  } else {
    // Se non c'è un hash, inizializza subito.
    initializeHighlighting();
  }

});
