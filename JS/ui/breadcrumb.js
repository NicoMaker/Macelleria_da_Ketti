/**
 * breadcrumb.js - Versione semplificata e funzionante
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ breadcrumb.js caricato!");

  // ===== 1. CREA IL BREADCRUMB =====
  const container = document.querySelector(".product-breadcrumb");
  if (container) {
    // Prende il nome dal titolo H1
    const h1 =
      document.querySelector("h1.product-title") ||
      document.querySelector("h1");
    const productName = h1 ? h1.innerText.trim() : "Prodotto";

    // Percorso FISSO: torna sempre alla root con ../
    container.innerHTML = `
      <a href="../index.html">Home</a>
      <span class="sep">›</span>
      <a href="../index.html#Prodotti">Prodotti</a>
      <span class="sep">›</span>
      <span>${productName}</span>
    `;
    console.log("✅ Breadcrumb creato:", productName);
  } else {
    console.warn("⚠️ Elemento .product-breadcrumb non trovato!");
  }

  // ===== 2. EVIDENZIA IL LINK "PRODOTTI" =====
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
