// ============================================================
// time-format-utils.js — Formattazione orari, date e telefono
// Dipende da: timezone-utils.js
// ============================================================

// Converte gli orari di una stringa nel fuso dell'utente.
// - Lavora in MINUTI totali → i fusi con mezz'ora (es. +5:30) sono corretti.
// - Se un orario scavalca la mezzanotte e vengono passati baseDate + nomiGiorni,
//   l'orario viene scritto col NOME del giorno reale (es. "Mercoledì alle 05:00").
//   Se baseDate/nomiGiorni non ci sono, ripiega sul marcatore (+1g)/(-1g).
//
// Parametri:
//   orarioStr  — stringa con gli orari (es. "09:00 - 22:00")
//   diffHours  — differenza in ore da applicare (può essere frazionaria)
//   baseDate   — (opzionale) Date UTC del giorno a cui appartengono gli orari
//   nomiGiorni — (opzionale) array nomi giorni indicizzato come getUTCDay() (0 = Domenica)
function convertOrarioString(orarioStr, diffHours, baseDate, nomiGiorni) {
  if (Math.abs(diffHours) < 0.01) return orarioStr;
  const deltaMin = Math.round(diffHours * 60);

  return orarioStr.replace(/(\d{1,2}):(\d{2})/g, (match, hh, mm) => {
    const totale = Number(hh) * 60 + Number(mm) + deltaMin;
    const shift = Math.floor(totale / 1440); // -1 = giorno prima, +1 = giorno dopo
    const wrapped = ((totale % 1440) + 1440) % 1440;
    const nh = Math.floor(wrapped / 60);
    const nm = wrapped % 60;

    let s = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;

    if (shift !== 0) {
      if (baseDate && nomiGiorni) {
        const d = new Date(baseDate);
        d.setUTCDate(d.getUTCDate() + shift);
        const nome = nomiGiorni[d.getUTCDay()];
        // Es. "Mercoledì alle 05:00" quando l'orario finisce in un altro giorno
        if (nome) s = `${nome} alle ${s}`;
        else s += shift > 0 ? `(+${shift}g)` : `(${shift}g)`;
      } else {
        s += shift > 0 ? `(+${shift}g)` : `(${shift}g)`;
      }
    }
    return s;
  });
}

// Compone la riga orario con le etichette che chiariscono quale blocco è
// l'ora del negozio e quale l'ora locale dell'utente.
//   testoBase        → orario nel fuso del negozio (es. "Domenica: 09:00 - 22:00")
//   orarioConvertito → stesso orario convertito nel fuso dell'utente
function formattaOrarioConFuso(testoBase, orarioConvertito) {
  const lbl =
    'font-size:0.8em;opacity:0.55;font-weight:400;letter-spacing:0.02em;';
  return (
    testoBase +
    ` <span style="${lbl}">(negozio)</span> → ` +
    orarioConvertito +
    ` <span style="${lbl}">(tua ora)</span>`
  );
}

function formatTimezoneOffsetText(offsetHours, shopName) {
  const abs = Math.abs(offsetHours);
  const ore = Math.floor(abs);
  const minuti = Math.round((abs - ore) * 60);

  // Se la differenza è meno di 1 minuto
  if (ore === 0 && minuti === 0) {
    return "stesso fuso orario";
  }

  // Arrotonda se i minuti sono 60
  let oreFinale = ore;
  let minutiFinali = minuti;
  if (minutiFinali >= 60) {
    oreFinale += 1;
    minutiFinali = 0;
  }

  let diffText = "";
  if (oreFinale > 0 && minutiFinali > 0) {
    diffText = `${oreFinale}h ${minutiFinali}m`;
  } else if (oreFinale > 0) {
    // "ora" al singolare, "ore" al plurale
    diffText = `${oreFinale} ${oreFinale === 1 ? "ora" : "ore"}`;
  } else {
    diffText = `${minutiFinali} minuti`;
  }

  const direction = offsetHours > 0 ? "avanti" : "indietro";
  const shopDisplay = shopName || "Macelleria da Ketti";
  return `Il negozio è ${diffText} ${direction} rispetto a te`;
}

// ── Sovrascriviamo getNow (definita in config.js) ──
if (typeof getNow !== "undefined") {
  getNow = getShopNow;
}

// ── Utility di formattazione data ──
const formatDateDM = (date) => {
  const giorno = String(date.getUTCDate()).padStart(2, "0");
  const mese = String(date.getUTCMonth() + 1).padStart(2, "0");
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
