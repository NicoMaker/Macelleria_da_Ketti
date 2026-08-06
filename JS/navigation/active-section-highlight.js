// ─────────────────────────────────────────────────────────────────────────────
// active-section-highlight.js — Individua la sezione visibile durante lo scroll
// Dipende da: active-section-state.js, active-section-update-link.js
// ─────────────────────────────────────────────────────────────────────────────

ActiveSectionNav.highlightNavigation = function () {
  if (ActiveSectionNav.isInitialLoad) return;

  const scrollY = window.pageYOffset;
  let currentSectionId = "";

  // Crea un array di sezioni con le loro posizioni
  const sectionPositions = Array.from(ActiveSectionNav.sections).map(
    (section) => ({
      id: section.getAttribute("id"),
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight,
    }),
  );

  // Controlla se siamo alla fine della pagina (Contatti)
  const windowBottom = scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (windowBottom >= documentHeight - 50) {
    currentSectionId = "Contatti";
  } else {
    // Trova la sezione corrente basandosi sulla posizione di scroll
    // Usa un offset per l'header
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 80;
    const scrollPosition = scrollY + headerHeight + 100; // Aggiungi un margine

    // Trova la sezione che contiene la posizione corrente
    for (let i = sectionPositions.length - 1; i >= 0; i--) {
      const section = sectionPositions[i];
      if (scrollPosition >= section.top) {
        currentSectionId = section.id;
        break;
      }
    }

    // Se siamo in cima alla pagina
    if (scrollY < 100) {
      currentSectionId = "Home";
    }
  }

  // Se non abbiamo trovato una sezione, usa Home come default
  if (!currentSectionId) {
    currentSectionId = "Home";
  }

  // Aggiorna i link di navigazione
  ActiveSectionNav.updateActiveLink(currentSectionId);

  // NON aggiornare l'hash se è bloccato
  if (ActiveSectionNav.preventHashUpdate) return;

  // Aggiorna l'hash SOLO se è diverso dall'attuale
  const currentHash = window.location.hash.substring(1);
  if (currentHash !== currentSectionId) {
    try {
      history.replaceState(null, null, `#${currentSectionId}`);
      console.log(`📍 Hash aggiornato: #${currentSectionId}`);
    } catch (e) {
      console.error("Errore nell'aggiornamento dell'hash:", e);
    }
  }
};
