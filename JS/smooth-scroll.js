document.addEventListener("DOMContentLoaded", () => {
  // Seleziona tutti i link che puntano a un'ancora interna
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      const href = this.getAttribute("href");

      // Assicurati che il link non sia solo un "#" vuoto
      if (href.length > 1) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          event.preventDefault(); // Previene il comportamento di default del link
          // Fa scorrere la pagina fino all'elemento target
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
});