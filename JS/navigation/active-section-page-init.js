// ─────────────────────────────────────────────────────────────────────────────
// active-section-page-init.js — Gestisce l'hash presente al caricamento pagina
// Dipende da: active-section-state.js, active-section-update-link.js,
//             active-section-highlight.js
// ─────────────────────────────────────────────────────────────────────────────

ActiveSectionNav.initializePage = function () {
  const hash = window.location.hash.substring(1);

  const scrollToHash = (targetId) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      ActiveSectionNav.updateActiveLink(targetId);

      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 80;

      if (targetId === "Prodotti") {
        if (window.pageYOffset > 0) {
          const offsetPosition = targetElement.offsetTop - headerHeight;
          window.scrollTo({ top: offsetPosition, behavior: "auto" });
        }
      } else if (targetId === "Contatti") {
        console.log("⬇️ Scrolling verso Contatti (fine pagina)");
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "auto",
          });
        }, 100);
      } else if (targetId === "Home") {
        console.log("🏠 Sezione Home, scroll non necessario.");
      } else {
        const offsetPosition = targetElement.offsetTop - headerHeight;
        window.scrollTo({ top: offsetPosition, behavior: "auto" });
      }

      ActiveSectionNav.preventHashUpdate = true;

      setTimeout(() => {
        ActiveSectionNav.preventHashUpdate = false;
        ActiveSectionNav.isInitialLoad = false;
        console.log("✅ Inizializzazione completata, sistema sbloccato");
      }, 1500);
    } else {
      ActiveSectionNav.preventHashUpdate = false;
      ActiveSectionNav.isInitialLoad = false;
      ActiveSectionNav.highlightNavigation();
    }
  };

  if (hash) {
    console.log(`🎯 Hash rilevato al caricamento: #${hash}`);

    if (hash === "Contatti") {
      ActiveSectionNav.preventHashUpdate = true;
      console.log(
        "🔄 In attesa del caricamento del footer per sezione Contatti...",
      );

      document.addEventListener(
        "footerLoaded",
        () => {
          console.log("✅ Footer caricato, scroll verso Contatti");
          scrollToHash(hash);
        },
        { once: true },
      );

      setTimeout(() => {
        if (!document.getElementById("Contatti")) {
          console.warn("⚠️ Timeout: Footer non caricato entro 5 secondi");
          ActiveSectionNav.preventHashUpdate = false;
          ActiveSectionNav.isInitialLoad = false;
          ActiveSectionNav.highlightNavigation();
        }
      }, 5000);
    } else {
      scrollToHash(hash);
    }
  } else {
    console.log("🏠 Nessun hash, imposto #Home");
    ActiveSectionNav.updateActiveLink("Home");
    history.replaceState(null, null, "#Home");

    setTimeout(() => {
      ActiveSectionNav.preventHashUpdate = false;
      ActiveSectionNav.isInitialLoad = false;
    }, 500);
  }
};
