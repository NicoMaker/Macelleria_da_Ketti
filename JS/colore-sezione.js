// Active section highlighting on scroll
// Questo script è il SOLO responsabile di aggiornare l'hash dell'URL

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer#Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  let isManualNavigation = false;
  let scrollTimeout;
  let preventHashUpdate = false;
  let isInitialLoad = true; // Flag per il caricamento iniziale

  function highlightNavigation() {
    // Durante il caricamento iniziale, NON calcolare automaticamente la sezione
    if (isInitialLoad) return;

    const scrollY = window.pageYOffset;
    let currentSectionId = "";

    // PRIMA controlla se siamo alla fine della pagina (Contatti)
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

  // Click su link
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      
      // Se clicchiamo su Contatti e non è ancora caricato
      if (targetId === 'Contatti' && !document.getElementById('Contatti')) {
        // Aspetta che il footer sia caricato
        document.addEventListener('footerLoaded', () => {
          scrollToSection(targetId);
        }, { once: true });
        return;
      }
      
      scrollToSection(targetId);
    });
  });

  function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    isManualNavigation = true;
    preventHashUpdate = true;

    updateActiveLink(targetId);
    history.replaceState(null, null, `#${targetId}`);

    // Calcola dinamicamente l'offset per lo scroll
    const header = document.querySelector('.site-header');
    let totalOffset = header ? header.offsetHeight : 80;

    const offsetPosition = targetElement.offsetTop - totalOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });

    // Sblocca dopo un momento
    setTimeout(() => {
      preventHashUpdate = false;
      isManualNavigation = false;
    }, 500);
  }

  // Scroll listener
  window.addEventListener("scroll", () => {
    if (isManualNavigation || isInitialLoad) return;

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

        // Applica lo stesso offset di scroll
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 80;
        
        if (targetId === 'Prodotti') {
          // Scroll solo se non siamo già in cima
          if (window.pageYOffset > 0) {
            const offsetPosition = targetElement.offsetTop - headerHeight;
            window.scrollTo({ top: offsetPosition, behavior: "auto" });
          }
        } else if (targetId === 'Contatti') {
          // Per Contatti, scroll alla fine della pagina
          console.log("⬇️ Scrolling verso Contatti (fine pagina)");
          setTimeout(() => {
            window.scrollTo({ 
              top: document.body.scrollHeight, 
              behavior: "auto" 
            });
          }, 100);
        } else if (targetId === 'Home') {
          // Per Home, non fare nulla, evita lo scroll all'avvio
          console.log("🏠 Sezione Home, scroll non necessario.");
        } else {
          const offsetPosition = targetElement.offsetTop - headerHeight;
          window.scrollTo({ top: offsetPosition, behavior: "auto" }); // Scroll per le altre sezioni
        }

        preventHashUpdate = true;
        
        // Sblocca il sistema dopo che lo scroll è completato
        setTimeout(() => {
          preventHashUpdate = false;
          isInitialLoad = false; // Disabilita il flag di caricamento iniziale
          console.log("✅ Inizializzazione completata, sistema sbloccato");
        }, 1500);
      } else {
        // Hash non valido o elemento non trovato
        preventHashUpdate = false;
        isInitialLoad = false;
        highlightNavigation();
      }
    };

    if (hash) {
      console.log(`🎯 Hash rilevato al caricamento: #${hash}`);
      
      // Se l'hash è "Contatti", aspetta che il footer sia caricato
      if (hash === 'Contatti') {
        preventHashUpdate = true;
        console.log("🔄 In attesa del caricamento del footer per sezione Contatti...");
        
        document.addEventListener('footerLoaded', () => {
          console.log("✅ Footer caricato, scroll verso Contatti");
          scrollToHash(hash);
        }, { once: true });
        
        // Timeout di sicurezza se il footer non si carica
        setTimeout(() => {
          if (!document.getElementById('Contatti')) {
            console.warn("⚠️ Timeout: Footer non caricato entro 5 secondi");
            preventHashUpdate = false;
            isInitialLoad = false;
            highlightNavigation();
          }
        }, 5000);
      } else {
        // Per tutte le altre sezioni, esegui subito lo scroll
        scrollToHash(hash);
      }
    } else {
      // Nessun hash: imposta Home come predefinito
      console.log("🏠 Nessun hash, imposto Home");
      updateActiveLink("Home");
      // history.replaceState(null, null, '#Home'); // Rimosso per evitare di aggiungere #Home all'URL all'avvio
      
      // Sblocca il sistema
      setTimeout(() => {
        preventHashUpdate = false;
        isInitialLoad = false;
      }, 500);
    }
  }

  initializePage();
});