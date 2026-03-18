document.addEventListener("DOMContentLoaded", () => {
  const sectionIndicator = document.getElementById("section-indicator");
  const baseTitle = "Macelleria da Ketti - Carne di Qualità dal 1985";

  if (!sectionIndicator) {
    return;
  }

  let observer;

  // Funzione per inizializzare l'observer
  function initializeObserver() {
    // Ottieni tutte le sezioni incluso il footer (che potrebbe essere caricato dinamicamente)
    const sections = document.querySelectorAll("section[id], footer[id]");

    if (sections.length === 0) {
      console.warn("⚠️ Nessuna sezione trovata per section-indicator");
      return;
    }

    const observerOptions = {
      root: null, // relative to the viewport
      rootMargin: "-50% 0px -50% 0px", // trigger when the section is in the middle of the screen
      threshold: 0,
    };

    // Disconnetti observer precedente se esiste
    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("id");
          // Use a more readable name if needed, otherwise use the ID
          const sectionName =
            entry.target.dataset.sectionName ||
            sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

          sectionIndicator.textContent = sectionName;
          sectionIndicator.style.opacity = "1";

          // Update the page title
          if (sectionId.toLowerCase() === "home") {
            document.title = baseTitle;
          } else {
            document.title = `${sectionName} - Macelleria da Ketti`;
          }

          console.log(`📍 Sezione attiva: ${sectionName}`);
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    console.log(
      `✅ Section indicator inizializzato per ${sections.length} sezioni`,
    );
  }

  // Inizializza subito
  initializeObserver();

  // Re-inizializza quando il footer viene caricato
  document.addEventListener("footerLoaded", () => {
    console.log("🔄 Footer caricato, re-inizializzo section indicator");
    // Piccolo delay per assicurarsi che il DOM sia aggiornato
    setTimeout(initializeObserver, 200);
  });
});
