document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");
  const footer = document.querySelector("#footer");
  const navLinks = document.querySelectorAll(".nav-link");

  const sezioneAttivaBox = document.createElement("div");
  sezioneAttivaBox.id = "sezione-attiva";
  sezioneAttivaBox.style.position = "fixed";
  sezioneAttivaBox.style.top = "0";
  sezioneAttivaBox.style.left = "0";
  sezioneAttivaBox.style.padding = "6px 12px";
  sezioneAttivaBox.style.fontWeight = "bold";
  sezioneAttivaBox.style.fontSize = "14px";
  sezioneAttivaBox.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  sezioneAttivaBox.style.zIndex = "10000";
  sezioneAttivaBox.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  sezioneAttivaBox.style.borderRadius = "0 0 8px 0";
  sezioneAttivaBox.textContent = "Ketti/Home";
  document.body.appendChild(sezioneAttivaBox);

  let lastSectionId = null;
  let forceHash = window.location.hash;

  const getScrollPosition = () => window.scrollY + 150;

  function getActiveSection() {
    const scrollPos = getScrollPosition();
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (footer && window.scrollY + windowHeight >= documentHeight - 150) {
      return { element: footer, id: "footer" }; // ID corretto per il footer
    }

    const sectionsArray = Array.from(sections).reverse();
    for (let section of sectionsArray) {
      const sectionTop = section.offsetTop - 150; // Aggiunto offset per rilevamento anticipato
      const sectionHeight = section.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        return { element: section, id: section.getAttribute("id") };
      }
    }

    if (sections.length > 0) {
      return { element: sections[0], id: sections[0].getAttribute("id") };
    }

    return null;
  }

  function updateActiveLink() {
    const activeSection = getActiveSection();
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (activeSection) {
        const linkHref = link.getAttribute("href");
        if (linkHref === `#${activeSection.id}`) {
          link.classList.add("active");
        }
      }
    });
  }

  function updateSectionHighlight() {
    const activeSection = getActiveSection();
    sections.forEach((section) => {
      section.classList.remove("section-highlighted");
    });
    if (footer) footer.classList.remove("section-highlighted");

    if (activeSection && activeSection.element) {
      activeSection.element.classList.add("section-highlighted");
    }
  }

  function displaySectionName(id) {
    let formatted = id.charAt(0).toUpperCase() + id.slice(1);
    // Se l'ID è 'footer', mostriamo 'Contatti'
    if (id === "footer") formatted = "Contatti";
    sezioneAttivaBox.textContent = `Ketti/${formatted}`;

    // NON sovrascrivere se siamo ancora nel primo scroll iniziale
    if (lastSectionId !== id) {
      if (!forceHash || forceHash === `#${lastSectionId}`) {
        history.replaceState(null, "", `#${id}`);
      }
      lastSectionId = id;
    }
  }

  function handleScroll() {
    const active = getActiveSection();
    if (active) {
      updateActiveLink();
      updateSectionHighlight();
      displaySectionName(active.id);
    }
  }

  // Scroll iniziale forzato all'hash
  function scrollToInitialHash() {
    if (forceHash) {
      const target = document.querySelector(forceHash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "auto", block: "start" });
          lastSectionId = forceHash.replace("#", ""); // blocca il primo replaceState
          forceHash = null; // usato una volta sola
        }, 300);
      }
    }
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", () => setTimeout(handleScroll, 100));
  navLinks.forEach((link) => {
    link.addEventListener("click", () => setTimeout(handleScroll, 500));
  });

  // Prima lo scroll manuale, poi il rilevamento attivo
  setTimeout(() => {
    scrollToInitialHash();
    handleScroll();
  }, 300);
});
