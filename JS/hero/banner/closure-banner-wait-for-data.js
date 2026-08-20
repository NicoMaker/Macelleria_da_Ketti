// ─────────────────────────────────────────────────────────────────────────────
// closure-banner-wait-for-data.js — Attende la disponibilità di JsonData
// Dipende da: json-loader.js (JsonData globale)
// ─────────────────────────────────────────────────────────────────────────────

const HeroClosureBanner = {};

HeroClosureBanner.waitForJsonData = function (callback) {
  if (typeof JsonData !== "undefined" && JsonData.load) {
    callback();
  } else {
    setTimeout(function () {
      HeroClosureBanner.waitForJsonData(callback);
    }, 100);
  }
};
