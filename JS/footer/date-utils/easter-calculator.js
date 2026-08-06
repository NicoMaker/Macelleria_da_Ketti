// ============================================================
// easter-calculator.js — Calcolo di Pasqua e Pasquetta
// Dipende da: time-format-utils.js (formatDateDM)
// ============================================================

function calcolaPasqua(anno) {
  const a = anno % 19;
  const b = Math.floor(anno / 100);
  const c = anno % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31);
  const giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(anno, mese - 1, giorno));
}

function getDatePasquali(anno) {
  const pasqua = calcolaPasqua(anno);
  const pasquetta = new Date(pasqua.getTime() + 24 * 3600 * 1000);
  return {
    pasqua: formatDateDM(pasqua),
    pasquetta: formatDateDM(pasquetta),
  };
}
