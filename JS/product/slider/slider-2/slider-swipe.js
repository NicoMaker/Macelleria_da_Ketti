/**
 * slider-swipe.js - Navigazione tramite swipe per dispositivi touch
 * Dipende da: slider-navigation.js
 */
function addSwipeNavigation(element) {
  let touchstartX = 0;
  let touchendX = 0;
  const swipeThreshold = 50; // Distanza minima in pixel per considerare uno swipe valido

  // Registra la posizione iniziale del touch
  element.addEventListener(
    "touchstart",
    function (event) {
      touchstartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  // Registra la posizione finale del touch e gestisci lo swipe
  element.addEventListener("touchend", function (event) {
    touchendX = event.changedTouches[0].screenX;
    handleSwipe();
  });

  // Determina la direzione dello swipe ed esegui l'azione corrispondente
  function handleSwipe() {
    const swipeDistance = touchendX - touchstartX;

    // Ignora movimenti troppo piccoli
    if (Math.abs(swipeDistance) < swipeThreshold) {
      return;
    }

    if (touchendX < touchstartX) {
      // Swipe verso sinistra: vai alla slide successiva
      plusSlides(1);
    } else if (touchendX > touchstartX) {
      // Swipe verso destra: vai alla slide precedente
      plusSlides(-1);
    }
  }
}
