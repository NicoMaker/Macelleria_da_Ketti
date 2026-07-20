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

function getShopOffsetMinutes() {
  const now = new Date();
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

function getShopNow() {
  const offset = getShopOffsetMinutes();
  return new Date(Date.now() + offset * 60000);
}

function getUserNow() {
  return new Date();
}

function getTimezoneOffsetHours() {
  const shopOffset = getShopOffsetMinutes();
  const userOffset = -new Date().getTimezoneOffset();
  return (shopOffset - userOffset) / 60;
}

function convertOrarioString(orarioStr, diffHours) {
  if (Math.abs(diffHours) < 0.01) return orarioStr;
  const regex = /(\d{1,2}:\d{2})/g;
  const matches = orarioStr.match(regex);
  if (!matches) return orarioStr;
  let result = orarioStr;
  for (const match of matches) {
    const [h, m] = match.split(":").map(Number);
    let newH = h + diffHours;
    newH = ((newH % 24) + 24) % 24;
    const newStr = `${String(Math.floor(newH)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    result = result.replace(match, newStr);
  }
  return result;
}

// ── Formatta la differenza di fuso in testo leggibile (con plurale corretto) ──
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
    // CORREZIONE: "ora" al singolare, "ore" al plurale
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
