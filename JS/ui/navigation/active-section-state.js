// ─────────────────────────────────────────────────────────────────────────────
// active-section-state.js — Stato condiviso e namespace del modulo
// Questo script è il SOLO responsabile di aggiornare l'hash dell'URL
// ─────────────────────────────────────────────────────────────────────────────

const ActiveSectionNav = {
  sections: null,
  navLinks: null,
  isManualNavigation: false,
  scrollTimeout: null,
  preventHashUpdate: false,
  isInitialLoad: true,
};
