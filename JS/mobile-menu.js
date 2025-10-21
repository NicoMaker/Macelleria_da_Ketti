document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const menu = document.getElementById("menu");
  const menuLinks = document.querySelectorAll(".nav-link");
  const mobileLogoLink = document.getElementById("mobile-logo-link");
  const body = document.body;

  // Toggle menu when hamburger is clicked
  hamburgerMenu.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("active");
    menu.classList.toggle("active");
    body.classList.toggle("menu-open");

    // Aggiungi effetto di animazione alle voci di menu
    if (menu.classList.contains("active")) {
      menuLinks.forEach((link, index) => {
        link.style.animation = `fadeInRight 0.5s forwards ${
          0.3 + index * 0.1
        }s`;
        link.style.opacity = "0"; // Inizialmente nascosto
      });
    } else {
      menuLinks.forEach((link) => {
        link.style.animation = "";
      });
    }
  });

  const closeMenu = () => {
    hamburgerMenu.classList.remove("active");
    menu.classList.remove("active");
    body.classList.remove("menu-open");
  };

  // Close menu when a link is clicked
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu when mobile logo is clicked
  if (mobileLogoLink) {
    mobileLogoLink.addEventListener("click", closeMenu);
  }

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnHamburger = hamburgerMenu.contains(event.target);

    if (
      !isClickInsideMenu &&
      !isClickOnHamburger &&
      menu.classList.contains("active")
    ) {
      hamburgerMenu.classList.remove("active");
      menu.classList.remove("active");
      body.classList.remove("menu-open");
    }
  });

  // Evidenzia la voce di menu attiva in base alla sezione visibile
  const sections = document.querySelectorAll(".section");

  function highlightActiveSection() {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    menuLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", highlightActiveSection);
  highlightActiveSection(); // Esegui all'avvio
});
