/**
 * slider-navigation.js - Navigazione prev/next e visualizzazione slide
 * Dipende da: slider-state.js
 */

// Navigazione con frecce prev/next
const plusSlides = (n) => {
  slideIndex += n;
  showSlides(slideIndex);
};

// Navigazione diretta tramite pallini
const currentSlide = (n) => {
  slideIndex = n;
  showSlides(slideIndex);
};

function showSlides(n) {
  const slides = document.getElementsByClassName("slide");
  const dots = document.getElementsByClassName("dot");

  // Gestione loop ciclico: se supera il numero di slide, torna all'inizio
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  // Nascondi tutte le slide
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  // Rimuovi la classe 'active' da tutti i pallini
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  // Mostra la slide corrente e attiva il pallino corrispondente
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].classList.add("active");
}
