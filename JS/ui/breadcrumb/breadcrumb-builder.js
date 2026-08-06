/**
 * breadcrumb-builder.js - Crea il breadcrumb nella pagina prodotto
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ breadcrumb-builder.js caricato!");

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
});
