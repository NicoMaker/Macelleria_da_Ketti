// More info toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const moreInfoButtons = document.querySelectorAll(".more-info-btn")

  moreInfoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target")
      const content = document.getElementById(targetId)
      const btnText = button.querySelector(".btn-text")
      const btnIcon = button.querySelector(".btn-icon") // Seleziona l'icona

      if (content) {
        button.classList.toggle("active")
        content.classList.toggle("active")

        // Aggiorna il testo e l'icona del pulsante
        if (content.classList.contains("active")) {
          btnText.textContent = "Mostra meno"
          if (btnIcon) btnIcon.textContent = "expand_less" // Cambia l'icona in freccia SU
        } else {
          btnText.textContent = "Scopri di più"
          if (btnIcon) btnIcon.textContent = "expand_more" // Ripristina l'icona freccia GIÙ
        }
      }
    })
  })
})
