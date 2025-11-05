// Active section highlighting on scroll
// Questo script è il SOLO responsabile di aggiornare l'hash dell'URL

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer#Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  let isManualNavigation = false;
  let scrollTimeout;
  let preventHashUpdate = false;

  function highlightNavigation() {
    const scrollY = window.pageYOffset;
    let currentSectionId = "";

    // PRIMA controlla se siamo alla fine della pagina (Contatti)
    // Aggiunto controllo per assicurarsi che l'elemento #Contatti esista.
    // Questo previene che la sezione "Contatti" venga impostata erroneamente
    // durante il caricamento iniziale prima che il footer sia renderizzato.
    const contattiSection = document.getElementById('Contatti');
    if (contattiSection && (window.innerHeight + scrollY) >= document.body.offsetHeight - 50) {
      currentSectionId = "Contatti";
    } else {
      // Trova la sezione corrente
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.3) {
          currentSectionId = section.getAttribute("id");
        }
      });

      // Se nessuna sezione trovata, è Home
      if (!currentSectionId) {
        currentSectionId = "Home";
      }
    }

    // Aggiorna i link di navigazione
    updateActiveLink(currentSectionId);

    // NON aggiornare l'hash se è bloccato
    if (preventHashUpdate) return;

    // Aggiorna l'hash SOLO se è diverso dall'attuale
    const currentHash = window.location.hash.substring(1);
    if (currentHash !== currentSectionId) {
      try {
        history.replaceState(null, null, `#${currentSectionId}`);
      } catch (e) {
        console.error("Errore nell'aggiornamento dell'hash:", e);
      }
    }
  }

  function updateActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const targetId = link.getAttribute("href").substring(1);
      link.classList.toggle("active", targetId === sectionId);
    });
  }

  // Click su link — SENZA scroll fluido per evitare problemi
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      isManualNavigation = true;
      preventHashUpdate = true;

      updateActiveLink(targetId);
      history.replaceState(null, null, `#${targetId}`);

      // Se la destinazione è la sezione Prodotti, gestisci lo scroll
      // per tenere conto dell'header e della barra dei filtri sticky.
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 80; // Fallback height

      if (targetId === 'Prodotti') {
        // Scroll to the top of the section, minus the header height.
        const offsetPosition = targetElement.offsetTop - headerHeight;
        window.scrollTo({ top: offsetPosition, behavior: "auto" });
      } else {
        // Scroll immediato senza animazione per le altre sezioni
        targetElement.scrollIntoView({ behavior: "auto" });
      }

      // Sblocca dopo un momento
      setTimeout(() => {
        preventHashUpdate = false;
        isManualNavigation = false;
      }, 500);
    });
  });

  // Scroll listener
  window.addEventListener("scroll", () => {
    if (isManualNavigation) return;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(highlightNavigation, 100);
  });

  // Inizializzazione
  function initializePage() {
    const hash = window.location.hash.substring(1);

    // Funzione helper per eseguire lo scroll e l'evidenziazione
    const scrollToHash = (targetId) => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        updateActiveLink(targetId);

        // Applica lo stesso offset di scroll per #Prodotti anche al caricamento della pagina
        if (targetId === 'Prodotti') {
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 80;
          const offsetPosition = targetElement.offsetTop - headerHeight;
          window.scrollTo({ top: offsetPosition, behavior: "auto" });
        } else {
          targetElement.scrollIntoView({ behavior: "auto" });
        }

        preventHashUpdate = true;
        setTimeout(() => {
          preventHashUpdate = false;
        }, 2000);
      } else {
        // Hash non valido o elemento non trovato
        preventHashUpdate = false;
        highlightNavigation();
      }
    };

    if (hash) {
      // Se l'hash è "Contatti", il footer viene caricato dinamicamente.
      // Dobbiamo attendere un evento personalizzato che segnali il caricamento del footer.
      if (hash === 'Contatti') {
        // Disabilita temporaneamente il listener dello scroll per evitare che
        // highlightNavigation() venga eseguito prima che lo scroll a #Contatti sia completato.
        isManualNavigation = true;
        document.addEventListener('footerLoaded', () => {
          scrollToHash(hash);
          // Riattiva il listener dello scroll dopo che lo scroll è avvenuto.
          setTimeout(() => {
            isManualNavigation = false;
          }, 500); // Un piccolo ritardo per sicurezza
        }, { once: true }); // L'evento viene ascoltato solo una volta
      } else {
        // Per tutte le altre sezioni, esegui subito lo scroll
        // perché sono già presenti nel DOM.
        scrollToHash(hash);
      }
    } else {
      // Nessun hash: calcola e imposta l'hash
      preventHashUpdate = false;
      highlightNavigation();
    }
  }

  initializePage();
});