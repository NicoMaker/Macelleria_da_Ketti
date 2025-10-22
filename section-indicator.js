document.addEventListener("DOMContentLoaded", () => {
  const sectionIndicator = document.getElementById("section-indicator");
  const sections = document.querySelectorAll("section[id]");

  if (!sectionIndicator || sections.length === 0) {
    return;
  }

  const observerOptions = {
    root: null, // relative to the viewport
    rootMargin: "-50% 0px -50% 0px", // trigger when the section is in the middle of the screen
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute("id");
        // Use a more readable name if needed, otherwise use the ID
        const sectionName =
          entry.target.dataset.sectionName ||
          sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        sectionIndicator.textContent = sectionName;
        sectionIndicator.style.opacity = "1";

        // Update the URL hash without adding to history
        const newUrl = window.location.pathname + window.location.search + '#' + sectionId;
        history.replaceState(null, '', newUrl);
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
});