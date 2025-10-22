// Scroll reveal animations
document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe elements
  const elementsToAnimate = document.querySelectorAll(".feature-card, .Progetti-card")
  elementsToAnimate.forEach((el) => {
    el.classList.add("scroll-reveal")
    observer.observe(el)
  })
})
