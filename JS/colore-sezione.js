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
    // Se la pagina viene caricata con un hash (es. #Contatti), il browser tenterà di scorrere.
    // Diamo un piccolo ritardo per assicurarci che lo scorrimento del browser sia terminato.
    setTimeout(() => {
      // Forziamo l'evidenziazione della sezione dall'hash iniziale per evitare che lo script
      // la cambi erroneamente al caricamento.
      forceHighlightFromHash();
      // Solo dopo aver impostato lo stato corretto, aggiungiamo il listener per lo scroll.
      initializeHighlighting();
    }, 150); // Aumentato leggermente il ritardo per maggiore stabilità
  } else {
    // Se non c'è un hash, inizializza subito.
    initializeHighlighting();
  }

});

function forceHighlightFromHash() {
  const hash = window.location.hash;
  if (!hash) return;

  const currentSectionId = hash.substring(1);
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href").substring(1);
    if (linkHref === currentSectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
