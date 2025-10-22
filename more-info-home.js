// More info toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const moreInfoButtons = document.querySelectorAll(".more-info-btn")

  moreInfoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target")
      const content = document.getElementById(targetId)
      const btnText = button.querySelector(".btn-text")

      if (content) {
        button.classList.toggle("active")
        content.classList.toggle("active")

        // Update button text
        if (content.classList.contains("active")) {
          btnText.textContent = "Mostra meno"
        } else {
          btnText.textContent = "Scopri di più"
        }
      }
    })
  })
})
