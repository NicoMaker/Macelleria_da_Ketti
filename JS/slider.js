let slideIndex = 1;

// Funzione per inizializzare lo slider quando la pagina è caricata
document.addEventListener("DOMContentLoaded", function() {
  const slides = document.getElementsByClassName("slide");
  const dotsContainer = document.querySelector(".dots-container");

  if (slides.length > 0 && dotsContainer) {
    // Crea un pallino per ogni slide
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      dot.onclick = function() { currentSlide(i + 1); };
      dotsContainer.appendChild(dot);
    }
  }

  showSlides(slideIndex); // Mostra la prima slide
});

// Controlli Avanti/Indietro
const plusSlides = (n) => showSlides((slideIndex += n));

// Controllo tramite anteprime
const currentSlide = (n) => showSlides((slideIndex = n));

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  // Nascondi tutte le slide
  for (i = 0; i < slides.length; i++) { 
    slides[i].style.display = "none";
  }
  // Rimuovi la classe 'active' da tutti i pallini
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}
