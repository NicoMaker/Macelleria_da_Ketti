document.addEventListener("DOMContentLoaded", () => {
  // Seleziona il pulsante "Torna a tutti i prodotti"
  const backButton = document.querySelector(".back-button");

  if (backButton) {
    backButton.addEventListener("click", function (event) {
      // Previene il comportamento predefinito del link (navigazione immediata)
      event.preventDefault();

      // Reindirizza l'utente alla pagina dei prodotti.
      // La pagina index.html si occuperà di ripristinare l'ultimo filtro/ricerca da localStorage.
      window.location.href = this.href;
    });
  }
});