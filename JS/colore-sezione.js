// Active section highlighting on scroll
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], footer#Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  function highlightNavigation() {
    const scrollY = window.pageYOffset;
    let currentSectionId = "";

    // Trova la sezione corrente basandosi sulla posizione rispetto alla finestra
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      // Attiva la sezione se la parte superiore è sopra il 30% della finestra
      if (scrollY >= sectionTop - window.innerHeight * 0.3) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Se nessuna sezione trovata (cioè siamo in cima)
    if (!currentSectionId) {
      currentSectionId = "Home";
    }

    // Caso speciale: siamo in fondo alla pagina → forza “Contatti”
    if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 50) {
      currentSectionId = "Contatti";
    }

    // Aggiorna la classe "active" sui link di navigazione
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href").substring(1);
      if (linkHref === currentSectionId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Aggiorna l'hash nell'URL senza aggiungere alla cronologia
    const currentHash = window.location.hash;
    const newHash = `#${currentSectionId}`;
    if (currentHash !== newHash) {
      try {
        history.replaceState(null, null, newHash);
      } catch (e) {
        console.error("Impossibile aggiornare l'hash dell'URL:", e);
      }
    }
  }

  function initializeHighlighting() {
    window.addEventListener("scroll", highlightNavigation);
    highlightNavigation(); // Stato iniziale
  }

  // Gestione del caricamento iniziale
  if (window.location.hash) {
    // Se carichiamo con un hash (#Contatti, #Novita, ecc.)
    window.scrollTo(0, 0); // Reset temporaneo per evitare glitch visivi
    setTimeout(() => {
      // Dopo che il browser ha completato lo scroll automatico verso l’hash
      highlightNavigation();
      initializeHighlighting();
    }, 500); // 500ms di delay per lasciare tempo al browser
  } else {
    // Nessun hash → inizializza subito
    initializeHighlighting();
  }
});
