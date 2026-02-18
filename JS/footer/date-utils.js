// ============================================================
// date-utils.js — Utility per date, formattazione e stagioni
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

// ============================================================
// Determina la stagione attiva in base alla data fornita.
// Gestisce correttamente i periodi a cavallo d'anno (es. 01/12 - 28/02).
// Restituisce l'oggetto stagione attiva oppure null se nessuna è attiva.
// ============================================================
function getStagioneAttiva(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length) return null;

  const ref = dataRiferimento || new Date();
  const anno = ref.getFullYear();

  // Converte "DD/MM" in un oggetto Date usando l'anno fornito
  const parseDataStagione = (ddmm, y) => {
    const [giorno, mese] = ddmm.split("/").map(Number);
    return new Date(y, mese - 1, giorno, 0, 0, 0, 0);
  };

  // Normalizza ref a mezzanotte per confronti corretti
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);

  for (const stagione of stagioni) {
    if (!stagione.inizio || !stagione.fine || !stagione.orari) continue;

    let dataInizio = parseDataStagione(stagione.inizio, anno);
    let dataFine = parseDataStagione(stagione.fine, anno);

    // Periodo a cavallo d'anno (es. 01/12 - 28/02)
    if (dataInizio.getTime() > dataFine.getTime()) {
      // Caso 1: siamo nella parte finale dell'anno (dopo l'inizio)
      // es. oggi = 15/12 → inizio=01/12 anno corrente, fine=28/02 anno prossimo
      const dataFineAnnoSucc = parseDataStagione(stagione.fine, anno + 1);
      if (oggi >= dataInizio) {
        if (oggi <= dataFineAnnoSucc) return stagione;
      }

      // Caso 2: siamo nella parte iniziale dell'anno (prima della fine)
      // es. oggi = 15/01 → inizio=01/12 anno precedente, fine=28/02 anno corrente
      const dataInizioPrecAnno = parseDataStagione(stagione.inizio, anno - 1);
      if (oggi <= dataFine && oggi >= dataInizioPrecAnno) {
        return stagione;
      }
    } else {
      // Periodo normale nello stesso anno (es. 01/06 - 31/08)
      if (oggi >= dataInizio && oggi <= dataFine) {
        return stagione;
      }
    }
  }

  return null;
}

// ============================================================
// Restituisce gli orari da usare oggi:
// orariExtra > stagione attiva > orari base
// ============================================================
function getOrariAttiviOggi(data, dataRiferimento) {
  const stagione = getStagioneAttiva(data, dataRiferimento);
  return {
    orari: stagione ? stagione.orari : data.orari || [],
    nomeStagione: stagione ? stagione.nome : null,
  };
}