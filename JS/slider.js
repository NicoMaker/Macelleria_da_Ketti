let slideIndex = 1;

// Funzione per inizializzare lo slider quando la pagina è caricata
document.addEventListener("DOMContentLoaded", function() {
  const slides = document.getElementsByClassName("slide");
  const dotsContainer = document.querySelector(".dots-container");
  const sliderContainer = document.querySelector(".slider-container");

  if (slides.length > 0) {
    // Crea un pallino per ogni slide
    if (dotsContainer) {
      for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dot.onclick = function() { currentSlide(i + 1); };
        dotsContainer.appendChild(dot);
      }
    }

    // Aggiungi navigazione da tastiera
    document.addEventListener("keydown", handleKeyboardNav);

    // Aggiungi navigazione tramite swipe per mobile/tablet
    if (sliderContainer) {
      addSwipeNavigation(sliderContainer);
    }

    showSlides(slideIndex); // Mostra la prima slide
  }
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

// Gestione navigazione da tastiera
function handleKeyboardNav(e) {
  if (e.key === "ArrowLeft") {
    plusSlides(-1);
  } else if (e.key === "ArrowRight") {
    plusSlides(1);
  }
}

// Gestione navigazione swipe
function addSwipeNavigation(element) {
  let touchstartX = 0;
  let touchendX = 0;
  const swipeThreshold = 50; // Minima distanza per considerare uno swipe

  element.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
  }, { passive: true });

  element.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    handleSwipe();
  }); 

  function handleSwipe() {
    const swipeDistance = touchendX - touchstartX;

    if (Math.abs(swipeDistance) < swipeThreshold) {
      return; // Non è uno swipe valido
    }

    if (touchendX < touchstartX) {
      // Swipe a sinistra -> slide successiva
      plusSlides(1);
    }

    if (touchendX > touchstartX) {
      // Swipe a destra -> slide precedente
      plusSlides(-1);
    }
  }
}
