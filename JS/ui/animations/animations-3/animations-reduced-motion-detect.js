// Rileva la preferenza "prefers-reduced-motion" dell'utente.
// Se le animazioni NON sono ridotte, aggiunge la classe "anim" al <html>,
// così il CSS può attivare le animazioni solo quando è sicuro farlo.
// Deve girare il prima possibile (prima del paint) per evitare flash visivi,
// quindi viene incluso in <head> come script sincrono e non-deferred.
(function () {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("anim");
  }
})();
