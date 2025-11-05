// sticky-controls.js
// Gestisce il calcolo dinamico dell'altezza dell'header per i controlli sticky

document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector('.site-header');
  const stickyControls = document.getElementById('product-controls-sticky');

  // Funzione per calcolare e impostare l'altezza dell'header
  function setHeaderHeight() {
    if (siteHeader && stickyControls) {
      const headerHeight = siteHeader.offsetHeight;
      
      // Imposta la posizione sticky in base all'altezza reale dell'header
      // Aggiungiamo 5px di margine per evitare sovrapposizioni
      const stickyTop = headerHeight + 5;
      stickyControls.style.top = `${stickyTop}px`;
      
      console.log(`📏 Header height: ${headerHeight}px - Sticky top: ${stickyTop}px`);
    }
  }

  // Imposta l'altezza iniziale
  setHeaderHeight();

  // Ricalcola quando la finestra viene ridimensionata
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setHeaderHeight, 100);
  });

  // Ricalcola quando cambia l'orientamento del dispositivo
  window.addEventListener('orientationchange', () => {
    setTimeout(setHeaderHeight, 300);
  });

  console.log("✅ Sistema sticky controls inizializzato");
});