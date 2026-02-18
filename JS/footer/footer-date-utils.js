// ============================================================
// footer-date-utils.js — Utility per date e formattazione
// ============================================================

const formatDateDM = (date) => {
  const giorno = String(date.getDate()).padStart(2, "0");
  const mese = String(date.getMonth() + 1).padStart(2, "0");
  return `${giorno}/${mese}`;
};

function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\s/g, "");

  if (cleaned.startsWith("+39")) {
    const prefix = "+39";
    const rest = cleaned.substring(3);

    if (rest.length === 10) {
      return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
    } else if (rest.length === 9) {
      return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 7)} ${rest.substring(7)}`;
    }
  }

  return phoneNumber;
}

// Algoritmo di Gauss per il calcolo della data di Pasqua
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

  return new Date(anno, mese - 1, giorno);
}

function getDatePasquali(anno) {
  const pasqua = calcolaPasqua(anno);
  const pasquetta = new Date(pasqua);
  pasquetta.setDate(pasquetta.getDate() + 1);

  return {
    pasqua: formatDateDM(pasqua),
    pasquetta: formatDateDM(pasquetta),
  };
}
