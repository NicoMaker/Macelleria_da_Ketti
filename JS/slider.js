/**
 * Slider.js - Sistema di navigazione per slideshow
 * Supporta: navigazione con frecce, tastiera, swipe mobile e pallini indicatori
 */

let slideIndex = 1;

// ============================================================================
// INIZIALIZZAZIONE
// ============================================================================

document.addEventListener("DOMContentLoaded", function() {
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

// ============================================================================
// CREAZIONE PALLINI INDICATORI
// ============================================================================

function createDots(numSlides, container) {
    for (let i = 0; i < numSlides; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dot.onclick = function() {
            currentSlide(i + 1);
        };
        container.appendChild(dot);
    }
}

// ============================================================================
// FUNZIONI DI NAVIGAZIONE
// ============================================================================

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

// ============================================================================
// VISUALIZZAZIONE SLIDE
// ============================================================================

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

// ============================================================================
// NAVIGAZIONE DA TASTIERA
// ============================================================================

function handleKeyboardNav(e) {
    if (e.key === "ArrowLeft") {
        plusSlides(-1); // Freccia sinistra: vai alla slide precedente
    } else if (e.key === "ArrowRight") {
        plusSlides(1);  // Freccia destra: vai alla slide successiva
    }
}

// ============================================================================
// NAVIGAZIONE SWIPE (Touch)
// ============================================================================

function addSwipeNavigation(element) {
    let touchstartX = 0;
    let touchendX = 0;
    const swipeThreshold = 50; // Distanza minima in pixel per considerare uno swipe valido
    
    // Registra la posizione iniziale del touch
    element.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].screenX;
    }, { passive: true });
    
    // Registra la posizione finale del touch e gestisci lo swipe
    element.addEventListener('touchend', function(event) {
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