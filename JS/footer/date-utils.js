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
// Calcola l'ultima domenica di un dato mese e anno.
// Usata per determinare automaticamente il cambio stagione
// (come il cambio ora legale: ultima domenica di marzo/ottobre).
// ============================================================
function ultimaDomenica(anno, mese) {
  // Parte dall'ultimo giorno del mese e va indietro fino alla domenica
  const ultimo = new Date(anno, mese, 0, 0, 0, 0, 0); // giorno 0 = ultimo del mese precedente
  while (ultimo.getDay() !== 0) {
    ultimo.setDate(ultimo.getDate() - 1);
  }
  return ultimo;
}

// ============================================================
// Risolve la data di inizio/fine di una stagione:
// - Se nel JSON c'è "auto-marzo"  → ultima domenica di marzo dell'anno dato
// - Se nel JSON c'è "auto-ottobre" → ultima domenica di ottobre dell'anno dato
// - Altrimenti usa la data DD/MM dal JSON come prima
// ============================================================
function _resolveDataStagione(ddmm, anno) {
  if (!ddmm) return null;

  // Supporta suffisso "-1" per indicare il giorno precedente (sabato prima della domenica)
  const minusOne = ddmm.endsWith("-1");
  const base = minusOne ? ddmm.slice(0, -2) : ddmm;

  let d;
  if (base === "auto-marzo") d = ultimaDomenica(anno, 3);
  else if (base === "auto-ottobre") d = ultimaDomenica(anno, 10);
  else {
    const [giorno, mese] = base.split("/").map(Number);
    d = new Date(anno, mese - 1, giorno, 0, 0, 0, 0);
  }

  if (minusOne) d.setDate(d.getDate() - 1); // torna al sabato
  return d;
}

// ============================================================
// Determina la stagione attiva in base alla data fornita.
// Gestisce correttamente i periodi a cavallo d'anno (es. 01/12 - 28/02).
// Supporta "auto-marzo" e "auto-ottobre" come valori di inizio/fine.
// Restituisce l'oggetto stagione attiva oppure null se nessuna è attiva.
// ============================================================
function getStagioneAttiva(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length) return null;

  const ref = dataRiferimento || new Date();
  const anno = ref.getFullYear();

  // Normalizza ref a mezzanotte per confronti corretti
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);

  for (const stagione of stagioni) {
    if (!stagione.inizio || !stagione.fine || !stagione.orari) continue;

    let dataInizio = _resolveDataStagione(stagione.inizio, anno);
    let dataFine = _resolveDataStagione(stagione.fine, anno);

    // Periodo a cavallo d'anno (es. fine ottobre → fine marzo)
    if (dataInizio.getTime() > dataFine.getTime()) {
      // Caso 1: siamo nella parte finale dell'anno (dopo l'inizio)
      // es. oggi = 15/11 → inizio=ultima-dom-ottobre anno corrente, fine=ultima-dom-marzo anno prossimo
      const dataFineAnnoSucc = _resolveDataStagione(stagione.fine, anno + 1);
      if (oggi >= dataInizio && oggi <= dataFineAnnoSucc) return stagione;

      // Caso 2: siamo nella parte iniziale dell'anno (prima della fine)
      // es. oggi = 15/02 → inizio=ultima-dom-ottobre anno precedente, fine=ultima-dom-marzo anno corrente
      const dataInizioPrecAnno = _resolveDataStagione(
        stagione.inizio,
        anno - 1,
      );
      if (oggi <= dataFine && oggi >= dataInizioPrecAnno) return stagione;
    } else {
      // Periodo normale nello stesso anno (es. ultima-dom-marzo → ultima-dom-ottobre)
      if (oggi >= dataInizio && oggi <= dataFine) return stagione;
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
