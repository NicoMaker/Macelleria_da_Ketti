document.addEventListener("DOMContentLoaded", function () {
  // Animate sections on scroll
  const animateOnScroll = () => {
    const sections = document.querySelectorAll(".animate-on-scroll");

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top,
        windowHeight = window.innerHeight;

      if (sectionTop < windowHeight * 0.75) section.classList.add("visible");
    });
  };

  // Animate project cards with staggered delay
  const animateProjectCards = () => {
    const cards = document.querySelectorAll(".Progetti-card");

    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.animationDelay = `${index * 0.1}s`;
      }, 100);
    });
  };

  // Animate footer when it's in view
  const animateFooter = () => {
    const footer = document.querySelector("footer"),
      footerTop = footer ? footer.getBoundingClientRect().top : 0,
      windowHeight = window.innerHeight;

    if (footer && footerTop < windowHeight * 0.9) {
      footer.classList.add("visible");
    }
  };

  // Run animations on page load
  animateOnScroll();
  setTimeout(animateProjectCards, 500);

  // Run animations on scroll
  window.addEventListener("scroll", () => {
    animateOnScroll();
    animateFooter();
  });

  // Add animation classes to elements on mobile
  if (window.innerWidth <= 768) {
    const addMobileAnimations = () => {
      document.querySelectorAll(".filter-button").forEach((button, index) => {
        button.classList.add("slide-in-right");
        button.style.animationDelay = `${index * 0.1}s`;
      });

      document
        .querySelectorAll(".contact-list li, .social-list li")
        .forEach((item, index) => {
          item.classList.add("slide-in-left");
          item.style.animationDelay = `${index * 0.1}s`;
        });
    };

    setTimeout(addMobileAnimations, 1000);
  }
});
