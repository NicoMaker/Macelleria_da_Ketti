const CategoryColors = (() => {
  let PALETTE = [];
  const _cache = {};
  let isLoaded = false;

  /**
   * Inizializzazione asincrona: carica i dati dal JSON.
   */
  async function init() {
    try {
      PALETTE = await JsonData.load(AppConfig.palette.jsonKey);
      isLoaded = true;
      console.log("Palette caricata:", PALETTE.length, "colori.");
    } catch (err) {
      console.error("Errore caricamento colori:", err);
      // Fallback in caso di errore per non lasciare il sito senza colori
      PALETTE = [{ bg: "#eee", text: "#333", border: "#ccc" }];
      isLoaded = true;
    }
  }

  function _hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return Math.abs(h);
  }

  function getColor(categoryName) {
    if (!isLoaded || PALETTE.length === 0)
      return { bg: "#eee", text: "#333", border: "#ccc" };
    if (_cache[categoryName] === undefined) {
      _cache[categoryName] = _hash(categoryName) % PALETTE.length;
    }
    return PALETTE[_cache[categoryName]];
  }

  function getBadgeStyle(categoryName) {
    const c = getColor(categoryName);
    return `background-color:${c.bg};color:${c.text};border:1px solid ${c.border};`;
  }

  function applyFilterButtonStyle(button, categoryName, isActive) {
    if (categoryName === "Tutti" || !categoryName) {
      if (isActive) {
        button.style.cssText =
          "background-color:#5c4a3a;color:#fff;border:3px solid #5c4a3a;transform:none;box-shadow:0 0 0 3px #8b7355, 0 4px 14px rgba(0,0,0,0.2);";
      } else {
        button.style.cssText =
          "background-color:#bf8b67;color:#fff;border:2px solid #bf8b67;";
        button.onmouseenter = () => {
          button.style.backgroundColor = "#5c4a3a";
          button.style.borderColor = "#5c4a3a";
          button.style.transform = "translateY(-3px)";
          button.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";
        };
        button.onmouseleave = () => {
          button.style.backgroundColor = "#bf8b67";
          button.style.borderColor = "#bf8b67";
          button.style.transform = "";
          button.style.boxShadow = "";
        };
      }
      return;
    }

    const c = getColor(categoryName);
    button.onmouseenter = null;
    button.onmouseleave = null;

    if (isActive) {
      button.style.cssText = `background-color:${c.text};color:#fff;border:3px solid ${c.text};transform:none;box-shadow:0 0 0 3px ${c.border}, 0 4px 14px ${c.border}88;`;
    } else {
      button.style.cssText = `background-color:${c.bg};color:${c.text};border:2px solid ${c.border};`;
      button.onmouseenter = () => {
        button.style.backgroundColor = c.text;
        button.style.color = "#fff";
        button.style.borderColor = c.text;
        button.style.transform = "translateY(-3px)";
        button.style.boxShadow = `0 6px 18px ${c.border}88`;
      };
      button.onmouseleave = () => {
        button.style.backgroundColor = c.bg;
        button.style.color = c.text;
        button.style.borderColor = c.border;
        button.style.transform = "";
        button.style.boxShadow = "";
      };
    }
  }

  function createBadge(categoryName) {
    const span = document.createElement("span");
    span.className = "categoria-badge";
    span.textContent = categoryName;
    span.style.cssText = getBadgeStyle(categoryName);
    return span;
  }

  function getBadgesHTML(categories, prefix) {
    if (!categories || categories.length === 0) return "";
    const prefixHtml = prefix ? `<span class="categoria-label">${prefix}</span>` : "";
    const badgesHtml = categories
      .map(
        (cat) =>
          `<span class="categoria-badge" style="${getBadgeStyle(cat)}">${cat}</span>`,
      )
      .join("");
    return `<p class="categoria-badges-wrapper">${prefixHtml}${badgesHtml}</p>`;
  }

  // Lanciamo l'inizializzazione immediatamente
  init();

  return {
    init, // Esponiamo init se serve rilanciarlo
    getColor,
    getBadgeStyle,
    createBadge,
    getBadgesHTML,
    applyFilterButtonStyle,
  };
})();

