let slideIndex = 1

document.addEventListener("DOMContentLoaded", () => {
  showSlides(slideIndex)
})

function plusSlides(n) {
  showSlides((slideIndex += n))
}

function currentSlide(n) {
  showSlides((slideIndex = n))
}

function showSlides(n) {
  let i
  const slides = document.getElementsByClassName("slide")
  const thumbs = document.getElementsByClassName("thumb-img")

  if (slides.length === 0) return

  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none"
  }

  for (i = 0; i < thumbs.length; i++) {
    thumbs[i].className = thumbs[i].className.replace(" active", "")
  }

  slides[slideIndex - 1].style.display = "block"

  if (thumbs.length > 0) {
    thumbs[slideIndex - 1].className += " active"
  }
}
