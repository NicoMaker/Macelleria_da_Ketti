// ============================================================
// countdown-html.js — HTML del countdown per il cambio stagione
// ============================================================

function _getCountdownHTML(transizione) {
  if (!transizione || transizione.eCambioOggi) return "";

  const stagioneAttivaLabel = transizione.da.toUpperCase();
  const stagioneProssimaLabel = transizione.a.toUpperCase();
  const g = transizione.giorniMancanti;
  const preview = g === 1 ? "1g" : g + "g";

  var styleContenitore =
    "display:block; margin-bottom:10px; padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13); width: 240px; box-sizing: border-box;";

  return (
    '<div id="countdown-stagione" style="' +
    styleContenitore +
    '">' +
    '<div id="countdown-content-wrapper">' +
    '<div id="countdown-header-labels" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:0.78em;letter-spacing:0.08em;font-weight:600;">' +
    '<span id="countdown-label-attiva" style="display:flex;align-items:center;gap:5px;"></span>' +
    '<span id="countdown-label-prossima" style="opacity:0.55;"></span>' +
    "</div>" +
    '<div style="font-size:1.35em;font-weight:800;letter-spacing:0.12em;font-variant-numeric:tabular-nums;" id="countdown-testo">' +
    preview +
    "</div>" +
    "</div>" +
    "</div>"
  );
}
