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
// Determina la stagione attiva in base alla data fornita e
// restituisce anche le date REALI dell'istanza corrente del ciclo.
//
// Esempio:
//   Estivo:   inizio=auto-marzo,  fine=auto-ottobre-1
//   Invernale: inizio=auto-ottobre, fine=auto-marzo-1
//
// Se oggi=25/10/2025, l'Invernale è attivo dal 26/10/2025 al 29/03/2026.
// L'anno del ciclo viene calcolato qui e restituito insieme alla stagione
// così le descrizioni nel footer possono mostrare le date corrette.
//
// Restituisce: { stagione, annoInizio, annoFine } oppure null.
// ============================================================
function getStagioneAttivaConDate(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length) return null;

  const ref = dataRiferimento || new Date();
  const anno = ref.getFullYear();

  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);

  for (const stagione of stagioni) {
    if (!stagione.inizio || !stagione.fine || !stagione.orari) continue;

    const dataInizio = _resolveDataStagione(stagione.inizio, anno);
    const dataFine = _resolveDataStagione(stagione.fine, anno);

    // Periodo a cavallo d'anno (fine < inizio nello stesso anno)
    if (dataInizio.getTime() > dataFine.getTime()) {
      // Caso 1: parte finale dell'anno → inizio=anno corrente, fine=anno+1
      const dataFineSucc = _resolveDataStagione(stagione.fine, anno + 1);
      if (oggi >= dataInizio && oggi <= dataFineSucc) {
        return { stagione, annoInizio: anno, annoFine: anno + 1 };
      }
      // Caso 2: parte iniziale dell'anno → inizio=anno-1, fine=anno corrente
      const dataInizioPrec = _resolveDataStagione(stagione.inizio, anno - 1);
      if (oggi <= dataFine && oggi >= dataInizioPrec) {
        return { stagione, annoInizio: anno - 1, annoFine: anno };
      }
    } else {
      // Periodo nello stesso anno
      if (oggi >= dataInizio && oggi <= dataFine) {
        return { stagione, annoInizio: anno, annoFine: anno };
      }
    }
  }

  // ── Fallback ciclico: nessun match esatto (gap di transizione) ──
  // Usa la stagione il cui inizio è più recente prima di oggi.
  const valide = stagioni.filter((s) => s.inizio && s.fine && s.orari);
  if (!valide.length) return null;

  let best = null;
  let bestDelta = Infinity;

  for (const stagione of valide) {
    for (const offset of [-1, 0, 1]) {
      const dataInizio = _resolveDataStagione(stagione.inizio, anno + offset);
      if (!dataInizio) continue;
      const delta = oggi.getTime() - dataInizio.getTime();
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        // Calcola annoFine: se inizio > fine nello stesso anno → fine è anno+offset+1
        const dataFine = _resolveDataStagione(stagione.fine, anno + offset);
        const annoFine =
          dataFine && dataInizio.getTime() > dataFine.getTime()
            ? anno + offset + 1
            : anno + offset;
        best = { stagione, annoInizio: anno + offset, annoFine };
      }
    }
  }

  return best;
}

// ============================================================
// Wrapper per compatibilità: restituisce solo la stagione
// ============================================================
function getStagioneAttiva(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return result ? result.stagione : null;
}

// ============================================================
// Restituisce gli orari da usare oggi:
// orariExtra > stagione attiva > orari base
// ============================================================
function getOrariAttiviOggi(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return {
    orari: result ? result.stagione.orari : data.orari || [],
    nomeStagione: result ? result.stagione.nome : null,
  };
}
