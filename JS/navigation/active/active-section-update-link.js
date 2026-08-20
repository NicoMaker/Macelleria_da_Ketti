// ─────────────────────────────────────────────────────────────────────────────
// active-section-update-link.js — Evidenzia il link di navigazione attivo
// Dipende da: active-section-state.js
// ─────────────────────────────────────────────────────────────────────────────

ActiveSectionNav.updateActiveLink = function (sectionId) {
  ActiveSectionNav.navLinks.forEach((link) => {
    const targetId = link.getAttribute("href").substring(1);
    if (targetId === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
  console.log(`🎯 Link attivo: ${sectionId}`);
};
