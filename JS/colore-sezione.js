// Active section highlighting on scroll
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer#Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  
  function highlightNavigation() {
    const scrollY = window.pageYOffset;
    let currentSectionId = "";

    // Trova la sezione corrente basandosi sulla sua posizione rispetto alla parte superiore della finestra.
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      // Considera una sezione attiva se la sua parte superiore è sopra il 30% della finestra.
      if (rect.top <= window.innerHeight * 0.3) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Se nessuna sezione è stata trovata (siamo in cima), imposta "Home".
    if (!currentSectionId) {
      currentSectionId = "Home";
    }

    // Caso speciale per la fine della pagina: se siamo quasi alla fine, forza "Contatti".
    if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 50) { // 50px di tolleranza
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
    document.addEventListener('readystatechange', event => {
      // Forziamo l'evidenziazione della sezione dall'hash iniziale per evitare che lo script
      // la cambi erroneamente al caricamento.
      if (event.target.readyState === 'complete') {
        // Diamo al browser un istante per completare lo scroll prima di inizializzare l'highlighting.
        // Questo previene una race condition in cui l'highlighting si attiva prima che lo scroll sia terminato.
        setTimeout(() => {
          initializeHighlighting();
        }, 100); // Un piccolo ritardo è sufficiente
      }
    }, { once: true });
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

function scrollToHash() {
  const hash = window.location.hash;
  if (hash) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'auto' });
    }
  }
}
