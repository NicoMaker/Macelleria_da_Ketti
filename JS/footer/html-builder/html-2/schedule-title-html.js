// ============================================================
// schedule-title-html.js — Titolo della sezione orari
// ============================================================

function _calcolaTitoloOrari(transizione, nomeStagione) {
  if (transizione && !transizione.eCambioOggi) {
    return (
      'Orario <span style="font-weight:900;">' +
      transizione.da +
      '</span><span style="font-weight:400;opacity:0.6;">/' +
      transizione.a +
      "</span>"
    );
  }
  if (nomeStagione) return "Orario " + nomeStagione;
  return "Orario";
}
