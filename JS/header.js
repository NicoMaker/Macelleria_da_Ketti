// Rileva se ci si trova in una sottocartella "Projects"
const isProjectsPage = window.location.pathname.includes("/Projects/");

// Percorsi dinamici
const basePath = isProjectsPage ? "../" : "";
const indexPath = `${basePath}index.html`;
const imgPath = `${basePath}img/logo.png`;

// Template unico per l'header
const headerHTML = `
  <div class="header-container">
    <div class="logo-container">
      <a href="${indexPath}#Home" class="logo-link">
        <img src="${imgPath}" alt="Macelleria da Ketti" class="logo" />
      </a>
    </div>

    <nav class="main-nav">
      <ul class="nav-list">
        <li><a href="${indexPath}#Home" class="nav-link">Home</a></li>
        <li><a href="${indexPath}#storia" class="nav-link">Storia</a></li>
        <li><a href="${indexPath}#novita" class="nav-link">Novità</a></li>
        <li><a href="${indexPath}#Prodotti" class="nav-link">Prodotti</a></li>
        <li><a href="#Contatti" class="nav-link">Contatti</a></li>
      </ul>
    </nav>

    <button class="mobile-menu-toggle" aria-label="Menu">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile Menu -->
  <div class="mobile-menu">
    <ul class="mobile-nav-list">
      <li><a href="${indexPath}#Home" class="mobile-nav-link">Home</a></li>
      <li><a href="${indexPath}#storia" class="mobile-nav-link">Storia</a></li>
      <li><a href="${indexPath}#novita" class="mobile-nav-link">Novità</a></li>
      <li><a href="${indexPath}#Prodotti" class="mobile-nav-link">Prodotti</a></li>
      <li><a href="#Contatti" class="mobile-nav-link">Contatti</a></li>
    </ul>
  </div>
`;

// Inserisce l’header nel punto corretto
if (isProjectsPage) {
  document.getElementById("header").innerHTML = headerHTML;
} else {
  document.getElementById("header").innerHTML = headerHTML;
}
