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
    if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 50) {
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

  // Click su link — con scroll fluido
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      isManualNavigation = true;
      preventHashUpdate = false; // Permetti aggiornamenti dopo il click

      updateActiveLink(targetId);
      history.replaceState(null, null, `#${targetId}`);

      targetElement.scrollIntoView({ behavior: "smooth" });

      // Blocca il ricalcolo fino a fine scroll
      setTimeout(() => {
        isManualNavigation = false;
      }, 1200);
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
    
    if (hash) {
      // C'è un hash: evidenzia SOLO il link, NON cambiare l'hash
      updateActiveLink(hash);
      
      // Blocca gli aggiornamenti dell'hash per 3 secondi
      preventHashUpdate = true;
      setTimeout(() => {
        preventHashUpdate = false;
      }, 3000);
    } else {
      // Nessun hash: calcola e imposta l'hash
      preventHashUpdate = false;
      highlightNavigation();
    }
  }

  initializePage();
});