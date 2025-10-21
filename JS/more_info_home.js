document.addEventListener("DOMContentLoaded", function () {
  const vToggle = document.getElementById("v-toggle");
  const upToggle = document.getElementById("up-toggle");
  const detailedInfo = document.getElementById("detailed-info");
  const homeSection = document.getElementById("Home");

  // Funzione per mostrare i dettagli
  vToggle.addEventListener("click", function () {
    detailedInfo.classList.add("show");
    vToggle.style.display = "none";
    upToggle.style.display = "flex";

    // Scroll verso il contenuto dettagliato con un leggero ritardo per l'animazione
    setTimeout(() => {
      detailedInfo.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 400);

    // Aggiorna lo sfondo della sezione Home per adattarsi al contenuto esteso
    homeSection.style.backgroundAttachment = "scroll";
    homeSection.style.minHeight = "auto";
  });

  // Funzione per nascondere i dettagli
  upToggle.addEventListener("click", function () {
    detailedInfo.classList.remove("show");
    vToggle.style.display = "flex";
    upToggle.style.display = "none";

    // Scroll verso l'inizio della sezione Home
    setTimeout(() => {
      homeSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    // Ripristina lo sfondo della sezione Home
    homeSection.style.backgroundAttachment = "fixed";
    homeSection.style.minHeight = "100vh";
  });

  // Aggiungi un effetto di pulsazione all'icona quando la pagina si carica
  setTimeout(() => {
    vToggle.style.animation = "pulse 2s infinite";
  }, 1000);

  // Aggiungi l'animazione CSS per il pulsing
  const style = document.createElement("style");
  style.textContent = `
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
            }
        }
      `;
  document.head.appendChild(style);
});
