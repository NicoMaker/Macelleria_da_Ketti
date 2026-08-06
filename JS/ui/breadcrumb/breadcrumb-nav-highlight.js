/**
 * breadcrumb-nav-highlight.js - Evidenzia il link "Prodotti" nel menu
 */
document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(
    '.nav-list a[href*="#Prodotti"], .mobile-nav-list a[href*="#Prodotti"]',
  );
  if (links.length > 0) {
    links.forEach(function (link) {
      link.classList.add("active");
    });
    console.log("✅ Link Prodotti evidenziato!");
  } else {
    console.warn("⚠️ Link #Prodotti non trovato nel menu!");
  }
});
