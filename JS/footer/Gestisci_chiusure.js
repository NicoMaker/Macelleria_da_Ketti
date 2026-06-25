// ============================================================
// Gestisci_chiusure.js — Logica chiusure (ferie, festività, extra)
// Dipende da: date-utils.js
//
// Unico array "chiusure" nel JSON — due formati:
//   { "tipo": "giorno",  "data": "31/10",   "motivo": "" }
//   { "tipo": "periodo", "inizio": "12/02", "fine": "19/02", "motivo": "Pippo" }
//
// Regola motivo:
//   - stringa non vuota → viene mostrata (es. "Chiusura natalizia")
//   - stringa vuota o assente → mostra "Ferie"
//
// Regola fine chiusura:
//   - la consecutività si ferma quando il giorno successivo
//     NON è chiuso OPPURE ha un motivo DIVERSO
//
// Voci con data/inizio/fine vuoti vengono ignorate automaticamente.
// ============================================================

// ── Utility interna ──────────────────────────────────────────

function _parseDDMM(ddmm, year) {
  const [day, month] = ddmm.split("/").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function _espandiPeriodo(inizio, fine, year, targetSet) {
  let dataInizio = _parseDDMM(inizio, year);
  let dataFine = _parseDDMM(fine, year);

  // Periodo a cavallo d'anno (es. 24/12 → 06/01)
  if (dataInizio.getTime() > dataFine.getTime()) {
    dataFine = _parseDDMM(fine, year + 1);
  }

  const cur = new Date(dataInizio);
  while (cur.getTime() <= dataFine.getTime()) {
    targetSet.add(formatDateDM(cur));
    cur.setDate(cur.getDate() + 1);
  }
}

// Normalizza il motivo: vuoto → "Ferie"
function _motivo(voce) {
  return voce.motivo && voce.motivo.trim() ? voce.motivo.trim() : "Ferie";
}

// ── Costruisce Set date + Map data→motivo da "chiusure" ──────

function _buildChiusureMap(data, year) {
  const dateSet = new Set();
  const motiviMap = new Map(); // DD/MM → motivo

  const chiusure = data.chiusure || [];

  for (const voce of chiusure) {
    if (!voce) continue;

    if (voce.tipo === "giorno" && voce.data && voce.data.trim()) {
      const d = voce.data.trim();
      dateSet.add(d);
      motiviMap.set(d, _motivo(voce));
    } else if (
      voce.tipo === "periodo" &&
      voce.inizio &&
      voce.inizio.trim() &&
      voce.fine &&
      voce.fine.trim()
    ) {
      const tmpSet = new Set();
      _espandiPeriodo(voce.inizio.trim(), voce.fine.trim(), year, tmpSet);
      const motivo = _motivo(voce);
      for (const d of tmpSet) {
        dateSet.add(d);
        motiviMap.set(d, motivo);
      }
    }
    // Voci con data/inizio/fine vuoti → ignorate silenziosamente
  }

  return { dateSet, motiviMap };
}

// ── API pubblica ─────────────────────────────────────────────

function getUnifiedFerieDates(data, year) {
  const { dateSet } = _buildChiusureMap(data, year);
  return dateSet;
}

function getMotivoChiusuraForDate(data, dataFormattata) {
  const year = new Date().getFullYear();
  const { motiviMap } = _buildChiusureMap(data, year);
  if (motiviMap.has(dataFormattata)) return motiviMap.get(dataFormattata);

  // Controlla anche anno precedente per periodi a cavallo d'anno
  const { motiviMap: mapPrec } = _buildChiusureMap(data, year - 1);
  return mapPrec.get(dataFormattata) || null;
}

// ── Orari Extra ──────────────────────────────────────────────

function getOrariExtraForDate(data, dataFormattata, dayOfWeek) {
  const orariExtra = data.orariExtra || [];
  const nomiGiorni = data.nomiGiorni;

  for (const item of orariExtra) {
    if (item.giorno === dataFormattata && item.orari) {
      const motivoTesto =
        item.motivo === "" || item.motivo == null ? "" : ` (${item.motivo})`;
      return `${nomiGiorni[dayOfWeek]}: ${item.orari}${motivoTesto}`;
    }
  }
  return null;
}

// ── Fine chiusura consecutiva (si ferma se cambia il motivo) ─

function findConsecutiveClosureEnd(startDate, unifiedFerieDates, motiviMap) {
  const startDateDM = formatDateDM(startDate);
  const motivoInizio = motiviMap ? motiviMap.get(startDateDM) : null;

  if (!unifiedFerieDates.has(startDateDM)) return startDateDM;

  const cur = new Date(startDate);
  let end = new Date(startDate);

  while (true) {
    cur.setDate(cur.getDate() + 1);
    const nextDM = formatDateDM(cur);

    // Fermati se il giorno successivo non è chiuso
    if (!unifiedFerieDates.has(nextDM)) break;

    // Fermati se il motivo del giorno successivo è diverso
    const motivoNext = motiviMap ? motiviMap.get(nextDM) : null;
    if (motivoInizio !== motivoNext) break;

    end = new Date(cur);
  }

  return formatDateDM(end);
}

// ── Controllo chiusura per un singolo giorno ─────────────────

function getSingleDayClosureReason(
  checkDate,
  data,
  unifiedFerieDates,
  unifiedFerieDatesNextYear = null,
) {
  const annoCorrente = checkDate.getFullYear();
  const { pasqua, pasquetta } = getDatePasquali(annoCorrente);

  const festivitaComplete = [...(data.festivita || []), pasqua, pasquetta];

  const dataFormattata = formatDateDM(new Date(checkDate));

  // 1. Festività
  if (festivitaComplete.includes(dataFormattata)) {
    return { reason: "festivita", dataChiusura: dataFormattata };
  }

  // 2. Chiusure anno corrente
  if (unifiedFerieDates.has(dataFormattata)) {
    const { motiviMap } = _buildChiusureMap(data, annoCorrente);
    const fineChiusura = findConsecutiveClosureEnd(
      new Date(checkDate),
      unifiedFerieDates,
      motiviMap,
    );
    const motivo = motiviMap.get(dataFormattata) || "Ferie";
    return {
      reason: "ferie",
      dataChiusura: fineChiusura,
      motivoSpecifico: motivo,
    };
  }

  // 3. Chiusure anno successivo (periodi a cavallo d'anno)
  if (
    unifiedFerieDatesNextYear &&
    unifiedFerieDatesNextYear.has(dataFormattata)
  ) {
    const { motiviMap } = _buildChiusureMap(data, annoCorrente + 1);
    const fineChiusura = findConsecutiveClosureEnd(
      new Date(checkDate),
      unifiedFerieDatesNextYear,
      motiviMap,
    );
    const motivo = motiviMap.get(dataFormattata) || "Ferie";
    return {
      reason: "ferie",
      dataChiusura: fineChiusura,
      motivoSpecifico: motivo,
    };
  }

  return null;
}

// ── Raccoglie TUTTE le chiusure future (ferie + festività + Pasqua) ──────────
//
// Restituisce un array ordinato per data di inizio di oggetti:
//   {
//     tipo:    "attiva" | "imminente",
//     label:   "Ferie" | "Festività" | nome motivo,
//     inizio:  Date,
//     fine:    Date,     // stesso giorno per giornate singole
//     inizioFmt: "DD/MM",
//     fineFmt:   "DD/MM",
//     giorni:  number,   // giorni mancanti all'inizio (0 = oggi)
//     isSingleDay: bool
//   }
//
// Parametri:
//   data          — oggetto JSON footer
//   oggiReal      — Date di riferimento
//   maxFuturedays — quanti giorni nel futuro considerare (default: 365)
// ─────────────────────────────────────────────────────────────────────────────
function getAllUpcomingClosures(data, oggiReal, maxFutureDays) {
  const oggi = new Date(oggiReal || new Date());
  oggi.setHours(0, 0, 0, 0);
  const currentYear = oggi.getFullYear();
  const maxDays = maxFutureDays !== undefined ? maxFutureDays : 365;

  const result = [];
  const seen = new Set(); // evita duplicati (chiave: "DD/MM-DD/MM-motivo")

  // ── Helper: aggiunge una voce se non duplicata ──
  function _add(inizioDate, fineDate, label) {
    const inizioFmt = formatDateDM(inizioDate);
    const fineFmt = formatDateDM(fineDate);
    const key = inizioFmt + "-" + fineFmt + "-" + label;
    if (seen.has(key)) return;
    seen.add(key);

    const oggiTs = oggi.getTime();
    const inizioTs = inizioDate.getTime();
    const fineTs = fineDate.getTime();

    let tipo;
    if (oggiTs >= inizioTs && oggiTs <= fineTs) {
      tipo = "attiva";
    } else if (inizioTs > oggiTs) {
      const diffDays = Math.round((inizioTs - oggiTs) / (1000 * 60 * 60 * 24));
      if (diffDays > maxDays) return;
      tipo = "imminente";
    } else {
      return; // già passata
    }

    const giorni =
      tipo === "attiva"
        ? 0
        : Math.round((inizioTs - oggiTs) / (1000 * 60 * 60 * 24));

    result.push({
      tipo,
      label,
      inizio: inizioDate,
      fine: fineDate,
      inizioFmt,
      fineFmt,
      giorni,
      isSingleDay: inizioFmt === fineFmt,
    });
  }

  // ── 1. Festività fisse dal JSON + Pasqua/Pasquetta ──
  for (const annoOffset of [0, 1]) {
    const anno = currentYear + annoOffset;
    const { pasqua, pasquetta } = getDatePasquali(anno);
    const festivitaComplete = [...(data.festivita || []), pasqua, pasquetta];

    for (const fest of festivitaComplete) {
      if (!fest || !fest.trim()) continue;
      const parts = fest.split("/").map(Number);
      const d = new Date(anno, parts[1] - 1, parts[0], 0, 0, 0, 0);
      _add(d, d, "Festività");
    }
  }

  // ── 2. Chiusure dal JSON (tipo "periodo" e "giorno") ──
  for (const annoOffset of [0, 1]) {
    const anno = currentYear + annoOffset;
    const chiusure = data.chiusure || [];

    for (const chiusura of chiusure) {
      if (!chiusura) continue;

      if (
        chiusura.tipo === "periodo" &&
        chiusura.inizio &&
        chiusura.inizio.trim() &&
        chiusura.fine &&
        chiusura.fine.trim()
      ) {
        const inizioParts = chiusura.inizio.split("/").map(Number);
        const fineParts = chiusura.fine.split("/").map(Number);
        let dataInizio = new Date(
          anno,
          inizioParts[1] - 1,
          inizioParts[0],
          0,
          0,
          0,
          0,
        );
        let dataFine = new Date(
          anno,
          fineParts[1] - 1,
          fineParts[0],
          0,
          0,
          0,
          0,
        );
        // Periodo a cavallo d'anno
        if (dataInizio.getTime() > dataFine.getTime()) {
          dataFine = new Date(
            anno + 1,
            fineParts[1] - 1,
            fineParts[0],
            0,
            0,
            0,
            0,
          );
        }
        const motivo =
          chiusura.motivo && chiusura.motivo.trim() ? chiusura.motivo : "Ferie";
        _add(dataInizio, dataFine, motivo);
      } else if (
        chiusura.tipo === "giorno" &&
        chiusura.data &&
        chiusura.data.trim()
      ) {
        const parts = chiusura.data.split("/").map(Number);
        const d = new Date(anno, parts[1] - 1, parts[0], 0, 0, 0, 0);
        const motivo =
          chiusura.motivo && chiusura.motivo.trim() ? chiusura.motivo : "Ferie";
        _add(d, d, motivo);
      }
    }
  }

  // Ordina: attive prima, poi per data di inizio crescente
  result.sort(function (a, b) {
    if (a.tipo === "attiva" && b.tipo !== "attiva") return -1;
    if (b.tipo === "attiva" && a.tipo !== "attiva") return 1;
    return a.inizio.getTime() - b.inizio.getTime();
  });

  return result;
}
