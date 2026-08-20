/**
 * slider-keyboard.js - Navigazione da tastiera (frecce sinistra/destra)
 * Dipende da: slider-navigation.js
 */
function handleKeyboardNav(e) {
  if (e.key === "ArrowLeft") {
    plusSlides(-1); // Freccia sinistra: vai alla slide precedente
  } else if (e.key === "ArrowRight") {
    plusSlides(1); // Freccia destra: vai alla slide successiva
  }
}
