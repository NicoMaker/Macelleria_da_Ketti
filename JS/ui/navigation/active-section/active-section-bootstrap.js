// ─────────────────────────────────────────────────────────────────────────────
// active-section-bootstrap.js — Entry point del modulo "sezione attiva"
// Dipende da: tutti i file active-section-*.js precedenti
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  ActiveSectionNav.sections = document.querySelectorAll(
    "section[id], footer#Contatti",
  );
  ActiveSectionNav.navLinks = document.querySelectorAll(
    ".nav-link, .mobile-nav-link",
  );

  // Click su link
  ActiveSectionNav.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);

      if (targetId === "Contatti" && !document.getElementById("Contatti")) {
        document.addEventListener(
          "footerLoaded",
          () => {
            ActiveSectionNav.scrollToSection(targetId);
          },
          { once: true },
        );
        return;
      }

      ActiveSectionNav.scrollToSection(targetId);
    });
  });

  // Scroll listener con debounce
  window.addEventListener("scroll", () => {
    if (ActiveSectionNav.isManualNavigation || ActiveSectionNav.isInitialLoad)
      return;

    clearTimeout(ActiveSectionNav.scrollTimeout);
    ActiveSectionNav.scrollTimeout = setTimeout(
      ActiveSectionNav.highlightNavigation,
      150,
    );
  });

  // Inizializzazione
  ActiveSectionNav.initializePage();
});
