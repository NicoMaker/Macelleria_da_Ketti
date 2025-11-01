// Active section highlighting on scroll
// Correzione definitiva del bug "Contatti → Novità"

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], #Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  let isManualNavigation = false;
  let scrollTimeout;
  let ignoreScroll = false;

  function highlightNavigation() {
    if (ignoreScroll) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const pageHeight = document.body.scrollHeight;

    let currentSectionId = "";

    // Se siamo in fondo, segna Contatti
    if (scrollY + windowHeight >= pageHeight - 10) {
      currentSectionId = "#Contatti";
    } else {
      // Trova la sezione più visibile al centro della viewport
      let bestSection = null;
      let minDistance = Infinity;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - windowHeight / 2);

        if (distance < minDistance && rect.bottom > 100) {
          minDistance = distance;
          bestSection = section;
        }
      });

      if (bestSection) {
        currentSectionId = bestSection.getAttribute("id");
      } else {
        currentSectionId = "Home";
      }
    }

    // Aggiorna i link
    navLinks.forEach((link) => {
      const targetId = link.getAttribute("href").substring(1);
      link.classList.toggle("active", targetId === currentSectionId);
    });

    // Aggiorna hash
    const currentHash = window.location.hash.substring(1);
    if (currentHash !== currentSectionId) {
      history.replaceState(null, null, `#${currentSectionId}`);
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
      ignoreScroll = true;

      updateActiveLink(targetId);
      history.replaceState(null, null, `#${targetId}`);

      targetElement.scrollIntoView({ behavior: "smooth" });

      // Blocca il ricalcolo fino a fine scroll (1s circa)
      setTimeout(() => {
        ignoreScroll = false;
        isManualNavigation = false;
        highlightNavigation(); // forza l’aggiornamento corretto
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
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    updateActiveLink(hash);
    setTimeout(highlightNavigation, 800);
  } else {
    highlightNavigation();
  }
});
