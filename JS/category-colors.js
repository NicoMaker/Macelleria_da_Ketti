// ─────────────────────────────────────────────────────────────────────────────
// category-colors.js — Colori automatici per categoria
// ─────────────────────────────────────────────────────────────────────────────

const CategoryColors = (() => {
  const PALETTE = [
    { bg: "#e8f4e8", text: "#2d6a2d", border: "#7dba7d" }, // Verde salvia    – Pollame
    { bg: "#fde8d8", text: "#8b3a0f", border: "#e07a45" }, // Terracotta      – Bovino
    { bg: "#e8e0f0", text: "#4a2070", border: "#9b6dcc" }, // Lavanda         – Suino
    { bg: "#fff3cd", text: "#7a5800", border: "#f0c040" }, // Ambra           – Preparati
    { bg: "#d8eef5", text: "#0f4d6e", border: "#4aa8d4" }, // Azzurro acciaio
    { bg: "#fde8f0", text: "#7a1040", border: "#d46088" }, // Rosa antico
    { bg: "#e8f0d8", text: "#3a5c10", border: "#88b848" }, // Verde mela
    { bg: "#f0e8d8", text: "#6e3a10", border: "#c88848" }, // Nocciola
    { bg: "#e0e8f8", text: "#1a3a7a", border: "#5878d8" }, // Blu cobalto
    { bg: "#f8e8e0", text: "#7a2a1a", border: "#d87858" }, // Rame
    { bg: "#e8f8f0", text: "#1a6a4a", border: "#50c890" }, // Menta
    { bg: "#f8f0e0", text: "#6a5010", border: "#d8a840" }, // Oro antico
  ];

  const _cache = {};

  function _hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return Math.abs(h);
  }

  function getColor(categoryName) {
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
        button.style.cssText = "background-color:#5c4a3a;color:#fff;border:3px solid #5c4a3a;transform:none;box-shadow:0 0 0 3px #8b7355, 0 4px 14px rgba(0,0,0,0.2);";
      } else {
        button.style.cssText = "background-color:#bf8b67;color:#fff;border:2px solid #bf8b67;";
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
      .map((cat) => `<span class="categoria-badge" style="${getBadgeStyle(cat)}">${cat}</span>`)
      .join("");
    return `<p class="categoria-badges-wrapper">${prefixHtml}${badgesHtml}</p>`;
  }

  return { getColor, getBadgeStyle, createBadge, getBadgesHTML, applyFilterButtonStyle };
})();