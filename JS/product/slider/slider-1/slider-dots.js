/**
 * slider-dots.js - Creazione dei pallini indicatori per ogni slide
 */
function createDots(numSlides, container) {
  for (let i = 0; i < numSlides; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.onclick = function () {
      currentSlide(i + 1);
    };
    container.appendChild(dot);
  }
}
