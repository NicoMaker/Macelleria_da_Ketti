// ============================================================
// date-utils.js — Utility per date, formattazione e stagioni
// ============================================================

// ── Variabili per il fuso orario del negozio ──
let _shopTimezone = "Europe/London";

// ── Funzioni per il fuso orario ──
function configuraTimezone(data) {
  if (data && data.timezone) {
    _shopTimezone = data.timezone;
  }
}

// Offset del negozio (in minuti) calcolato per una data specifica.
// Passare una data di riferimento serve per gestire correttamente
// i cambi di ora legale sui giorni futuri.
function getShopOffsetMinutesForDate(refDate) {
  const now = refDate || new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: _shopTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const obj = {};
  parts.forEach((p) => {
    obj[p.type] = p.value;
  });
  const localDate = new Date(
    Date.UTC(
      parseInt(obj.year),
      parseInt(obj.month) - 1,
      parseInt(obj.day),
      parseInt(obj.hour),
      parseInt(obj.minute),
      parseInt(obj.second),
    ),
  );
  return (localDate.getTime() - now.getTime()) / 60000;
}

function getShopOffsetMinutes() {
  return getShopOffsetMinutesForDate(new Date());
}

function getShopNow() {
  const offset = getShopOffsetMinutes();
  return new Date(Date.now() + offset * 60000);
}

function getUserNow() {
  return new Date();
}

// Differenza (in ore) tra fuso negozio e fuso utente per una data specifica.
// getTimezoneOffset() sulla data giusta tiene conto dell'ora legale dell'utente.
function getTimezoneOffsetHoursForDate(refDate) {
  const d = refDate || new Date();
  const shopOffset = getShopOffsetMinutesForDate(d);
  const userOffset = -d.getTimezoneOffset();
  return (shopOffset - userOffset) / 60;
}

function getTimezoneOffsetHours() {
  return getTimezoneOffsetHoursForDate(new Date());
}

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

// ── Utility di formattazione ──
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

function ultimaDomenica(anno, mese) {
  const ultimo = new Date(Date.UTC(anno, mese, 0, 0, 0, 0, 0));
  while (ultimo.getUTCDay() !== 0) {
    ultimo.setUTCDate(ultimo.getUTCDate() - 1);
  }
  return ultimo;
}

let _meseEstivo = 3;
let _meseInvernale = 10;

function configuraCambioStagione(data) {
  if (data && data.cambioStagione) {
    _meseEstivo = data.cambioStagione.meseEstivo || 3;
    _meseInvernale = data.cambioStagione.meseInvernale || 10;
  }
}

function getDateCambioStagione(anno) {
  const ultimaDomEstivo = ultimaDomenica(anno, _meseEstivo);
  const ultimaDomInvernale = ultimaDomenica(anno, _meseInvernale);
  const fineEstivo = new Date(ultimaDomInvernale.getTime());
  fineEstivo.setUTCDate(fineEstivo.getUTCDate() - 1);
  const fineInvernale = new Date(ultimaDomEstivo.getTime());
  fineInvernale.setUTCDate(fineInvernale.getUTCDate() - 1);
  return {
    inizioEstivo: ultimaDomEstivo,
    fineEstivo: fineEstivo,
    inizioInvernale: ultimaDomInvernale,
    fineInvernale: fineInvernale,
  };
}

function getStagioneAttivaConDate(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length) return null;

  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setUTCHours(0, 0, 0, 0);
  const anno = oggi.getUTCFullYear();

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    const stagEstiva = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "estivo",
    );
    if (stagEstiva) {
      const ini = new Date(date.inizioEstivo);
      ini.setUTCHours(0, 0, 0, 0);
      const fin = new Date(date.fineEstivo);
      fin.setUTCHours(0, 0, 0, 0);
      if (oggi >= ini && oggi <= fin) {
        return { stagione: stagEstiva, annoInizio: a, annoFine: a };
      }
    }

    const stagInvernale = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "invernale",
    );
    if (stagInvernale) {
      const ini = new Date(date.inizioInvernale);
      ini.setUTCHours(0, 0, 0, 0);
      const dateNext = getDateCambioStagione(a + 1);
      const fin = new Date(dateNext.fineInvernale);
      fin.setUTCHours(0, 0, 0, 0);
      if (oggi >= ini && oggi <= fin) {
        return { stagione: stagInvernale, annoInizio: a, annoFine: a + 1 };
      }
    }
  }

  const valide = stagioni.filter((s) => s.orari);
  if (!valide.length) return null;

  let best = null;
  let bestDelta = Infinity;
  for (const stagione of valide) {
    const isEstivo = stagione.nome && stagione.nome.toLowerCase() === "estivo";
    for (const offset of [-1, 0, 1]) {
      const a = anno + offset;
      const date = getDateCambioStagione(a);
      const ini = isEstivo ? date.inizioEstivo : date.inizioInvernale;
      const dataInizio = new Date(ini);
      dataInizio.setUTCHours(0, 0, 0, 0);
      const delta = oggi.getTime() - dataInizio.getTime();
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        const annoFine = isEstivo ? a : a + 1;
        best = { stagione, annoInizio: a, annoFine };
      }
    }
  }
  return best;
}

function getStagioneAttiva(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return result ? result.stagione : null;
}

function getOrariAttiviOggi(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return {
    orari: result ? result.stagione.orari : data.orari || [],
    nomeStagione: result ? result.stagione.nome : null,
  };
}

function _testoStagioneConAnni(stagione, annoInizio, annoFine) {
  const nome = stagione.nome || "";
  const isEstivo = nome.toLowerCase() === "estivo";
  const dateIni = getDateCambioStagione(annoInizio);
  const dateFin = getDateCambioStagione(annoFine);
  let dataInizio, dataFine;
  if (isEstivo) {
    dataInizio = dateIni.inizioEstivo;
    dataFine = dateFin.fineEstivo;
  } else {
    dataInizio = dateIni.inizioInvernale;
    dataFine = dateFin.fineInvernale;
  }
  const strIni = `${formatDateDM(dataInizio)}/${annoInizio}`;
  const strFin = `${formatDateDM(dataFine)}/${annoFine}`;
  return `Orario ${nome}: dal ${strIni} al ${strFin}`;
}

function _getProssimaIstanzaStagione(stagione, dataRiferimento) {
  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setUTCHours(0, 0, 0, 0);
  const anno = oggi.getUTCFullYear();
  const isEstivo = stagione.nome && stagione.nome.toLowerCase() === "estivo";
  for (const offset of [0, 1, 2]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);
    const ini = new Date(isEstivo ? date.inizioEstivo : date.inizioInvernale);
    ini.setUTCHours(0, 0, 0, 0);
    if (ini.getTime() >= oggi.getTime()) {
      const annoFine = isEstivo ? a : a + 1;
      return { annoInizio: a, annoFine };
    }
  }
  return { annoInizio: anno + 1, annoFine: anno + 1 };
}

function getRilevaTransizioneStagione(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (stagioni.length < 2) return null;

  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setUTCHours(0, 0, 0, 0);
  const anno = oggi.getUTCFullYear();
  const fine7gg = new Date(oggi);
  fine7gg.setUTCDate(fine7gg.getUTCDate() + 6);
  fine7gg.setUTCHours(0, 0, 0, 0);

  const diffGiorni = (dateA, dateB) =>
    Math.round((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    const iniEst = new Date(date.inizioEstivo);
    iniEst.setUTCHours(0, 0, 0, 0);
    if (iniEst >= oggi && iniEst <= fine7gg) {
      const giorni = diffGiorni(iniEst, oggi);
      return {
        da: "Invernale",
        a: "Estivo",
        giorniMancanti: giorni,
        eCambioOggi: giorni === 0,
      };
    }

    const iniInv = new Date(date.inizioInvernale);
    iniInv.setUTCHours(0, 0, 0, 0);
    if (iniInv >= oggi && iniInv <= fine7gg) {
      const giorni = diffGiorni(iniInv, oggi);
      return {
        da: "Estivo",
        a: "Invernale",
        giorniMancanti: giorni,
        eCambioOggi: giorni === 0,
      };
    }
  }
  return null;
}