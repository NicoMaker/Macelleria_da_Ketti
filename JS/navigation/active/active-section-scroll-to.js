// ─────────────────────────────────────────────────────────────────────────────
// active-section-scroll-to.js — Scroll manuale verso una sezione (click su link)
// Dipende da: active-section-state.js, active-section-update-link.js
// ─────────────────────────────────────────────────────────────────────────────

ActiveSectionNav.scrollToSection = function (targetId) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) {
    console.warn(`⚠️ Sezione ${targetId} non trovata`);
    return;
  }

  ActiveSectionNav.isManualNavigation = true;
  ActiveSectionNav.preventHashUpdate = true;

  ActiveSectionNav.updateActiveLink(targetId);
  history.replaceState(null, null, `#${targetId}`);

  const header = document.querySelector(".site-header");
  const totalOffset = header ? header.offsetHeight : 80;

  const offsetPosition = targetElement.offsetTop - totalOffset;
  window.scrollTo({ top: offsetPosition, behavior: "smooth" });

  console.log(`🔄 Scroll verso: ${targetId}`);

  setTimeout(() => {
    ActiveSectionNav.preventHashUpdate = false;
    ActiveSectionNav.isManualNavigation = false;
  }, 800);
};
