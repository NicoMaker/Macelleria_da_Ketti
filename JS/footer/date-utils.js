// ============================================================
// date-utils.js — Utility per date, formattazione e stagioni
// Le date di cambio stagione sono gestite qui, NON nel JSON.
// Estivo:   dall'ultima domenica di marzo → al sabato prima dell'ultima domenica di ottobre
// Invernale: dall'ultima domenica di ottobre → al sabato prima dell'ultima domenica di marzo
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
// ============================================================
function ultimaDomenica(anno, mese) {
  const ultimo = new Date(anno, mese, 0, 0, 0, 0, 0);
  while (ultimo.getDay() !== 0) {
    ultimo.setDate(ultimo.getDate() - 1);
  }
  return ultimo;
}

// ============================================================
// Date di cambio stagione per un dato anno.
// I mesi di cambio si leggono da data.cambioStagione nel JSON:
//   { "meseEstivo": 3, "meseInvernale": 10 }
// Se assenti, si usano i valori di default (marzo=3, ottobre=10).
//
//   inizioEstivo    = ultima domenica del mese estivo
//   fineEstivo      = sabato prima dell'ultima domenica del mese invernale
//   inizioInvernale = ultima domenica del mese invernale
//   fineInvernale   = sabato prima dell'ultima domenica del mese estivo
// ============================================================

// Cache globale dei mesi (viene popolata al primo uso)
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
  const ultimaDomMarzo = ultimaDomEstivo;
  const ultimaDomOttobre = ultimaDomInvernale;

  const fineEstivo = new Date(ultimaDomOttobre);
  fineEstivo.setDate(fineEstivo.getDate() - 1); // sabato prima

  const fineInvernale = new Date(ultimaDomMarzo);
  fineInvernale.setDate(fineInvernale.getDate() - 1); // sabato prima

  return {
    inizioEstivo: ultimaDomMarzo,
    fineEstivo: fineEstivo,
    inizioInvernale: ultimaDomOttobre,
    fineInvernale: fineInvernale,
  };
}

// ============================================================
// Determina la stagione attiva in base alla data fornita.
// Cerca tra le stagioni del JSON abbinando per nome "Estivo"/"Invernale".
// Restituisce: { stagione, annoInizio, annoFine } oppure null.
// ============================================================
function getStagioneAttivaConDate(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length) return null;

  const ref = dataRiferimento || new Date();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();

  // Controlla anni corrente e adiacenti per gestire cavallo d'anno
  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    // Stagione Estiva: inizioEstivo(a) → fineEstivo(a)
    const stagEstiva = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "estivo"
    );
    if (stagEstiva) {
      const ini = new Date(date.inizioEstivo);
      ini.setHours(0, 0, 0, 0);
      const fin = new Date(date.fineEstivo);
      fin.setHours(0, 0, 0, 0);
      if (oggi >= ini && oggi <= fin) {
        return { stagione: stagEstiva, annoInizio: a, annoFine: a };
      }
    }

    // Stagione Invernale: inizioInvernale(a) → fineInvernale(a+1)
    const stagInvernale = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "invernale"
    );
    if (stagInvernale) {
      const ini = new Date(date.inizioInvernale);
      ini.setHours(0, 0, 0, 0);
      const dateNext = getDateCambioStagione(a + 1);
      const fin = new Date(dateNext.fineInvernale);
      fin.setHours(0, 0, 0, 0);
      if (oggi >= ini && oggi <= fin) {
        return { stagione: stagInvernale, annoInizio: a, annoFine: a + 1 };
      }
    }
  }

  // Fallback: nessun match (non dovrebbe succedere con Estivo+Invernale completi)
  // Usa la stagione il cui inizio è più recente prima di oggi
  const valide = stagioni.filter((s) => s.orari);
  if (!valide.length) return null;

  // Prova a trovare quella più vicina
  let best = null;
  let bestDelta = Infinity;

  for (const stagione of valide) {
    const isEstivo = stagione.nome && stagione.nome.toLowerCase() === "estivo";
    for (const offset of [-1, 0, 1]) {
      const a = anno + offset;
      const date = getDateCambioStagione(a);
      const ini = isEstivo ? date.inizioEstivo : date.inizioInvernale;
      const dataInizio = new Date(ini);
      dataInizio.setHours(0, 0, 0, 0);
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

// ============================================================
// Wrapper per compatibilità: restituisce solo la stagione
// ============================================================
function getStagioneAttiva(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return result ? result.stagione : null;
}

// ============================================================
// Restituisce gli orari da usare oggi:
// stagione attiva > orari base
// ============================================================
function getOrariAttiviOggi(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return {
    orari: result ? result.stagione.orari : data.orari || [],
    nomeStagione: result ? result.stagione.nome : null,
  };
}

// ============================================================
// Calcola il testo descrittivo di una stagione con le date reali
// Es: "Orario Estivo: dal 30/03/2025 al 25/10/2025"
// ============================================================
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

// ============================================================
// Calcola la prossima istanza futura di una stagione
// Usata per le stagioni non attive
// ============================================================
function _getProssimaIstanzaStagione(stagione, dataRiferimento) {
  const ref = dataRiferimento || new Date();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();
  const isEstivo =
    stagione.nome && stagione.nome.toLowerCase() === "estivo";

  for (const offset of [0, 1, 2]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);
    const ini = new Date(isEstivo ? date.inizioEstivo : date.inizioInvernale);
    ini.setHours(0, 0, 0, 0);
    if (ini.getTime() >= oggi.getTime()) {
      const annoFine = isEstivo ? a : a + 1;
      return { annoInizio: a, annoFine };
    }
  }

  return { annoInizio: anno + 1, annoFine: anno + 1 };
}

// ============================================================
// Rileva se nei prossimi 7 giorni a partire da dataRiferimento
// avviene un cambio stagione, e se sì quale.
//
// Restituisce:
//   null → nessun cambio nella settimana
//   { da: "Invernale", a: "Estivo" }   → cambio verso estivo
//   { da: "Estivo",    a: "Invernale" } → cambio verso invernale
// ============================================================
function getRilevaTransizioneStagione(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (stagioni.length < 2) return null;

  const ref = dataRiferimento || new Date();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();

  const fine7gg = new Date(oggi);
  fine7gg.setDate(fine7gg.getDate() + 6);
  fine7gg.setHours(0, 0, 0, 0);

  // Helper: differenza in giorni interi (dateA - dateB)
  const diffGiorni = (dateA, dateB) =>
    Math.round((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    // Cambio verso Estivo: inizioEstivo cade nei 7 giorni?
    const iniEst = new Date(date.inizioEstivo);
    iniEst.setHours(0, 0, 0, 0);
    if (iniEst >= oggi && iniEst <= fine7gg) {
      const giorni = diffGiorni(iniEst, oggi);
      return { da: "Invernale", a: "Estivo", giorniMancanti: giorni, eCambioOggi: giorni === 0 };
    }

    // Cambio verso Invernale: inizioInvernale cade nei 7 giorni?
    const iniInv = new Date(date.inizioInvernale);
    iniInv.setHours(0, 0, 0, 0);
    if (iniInv >= oggi && iniInv <= fine7gg) {
      const giorni = diffGiorni(iniInv, oggi);
      return { da: "Estivo", a: "Invernale", giorniMancanti: giorni, eCambioOggi: giorni === 0 };
    }
  }

  return null;
}