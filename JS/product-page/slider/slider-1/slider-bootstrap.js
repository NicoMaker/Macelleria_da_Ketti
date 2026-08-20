/**
 * slider-bootstrap.js - Inizializzazione dello slider
 * Dipende da: slider-state.js, slider-dots.js, slider-navigation.js,
 *             slider-keyboard.js, slider-swipe.js
 */
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.getElementsByClassName("slide");
  const dotsContainer = document.querySelector(".dots-container");
  const sliderContainer = document.querySelector(".slider-container");

  if (slides.length > 0) {
    // Crea i pallini indicatori per ogni slide
    if (dotsContainer) {
      createDots(slides.length, dotsContainer);
    }

    // Aggiungi navigazione da tastiera (frecce sinistra/destra)
    document.addEventListener("keydown", handleKeyboardNav);

    // Aggiungi navigazione tramite swipe per dispositivi touch
    if (sliderContainer) {
      addSwipeNavigation(sliderContainer);
    }

    // Mostra la prima slide all'avvio
    showSlides(slideIndex);
  }
});
