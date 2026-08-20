// ─────────────────────────────────────────────────────────────
// animations-state.js — Macelleria da Ketti
// Namespace, costanti e stato condiviso del motore animazioni in stile
// "Da Prat Falegnameria". Testi, colori e font del sito restano invariati.
// ─────────────────────────────────────────────────────────────

var SiteAnimations = {
  PHONE: "+393357802124", // da JSON/footer.json
  WA_TEXT: "Buongiorno! Vorrei informazioni sui vostri prodotti.",
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  observer: null,
};
