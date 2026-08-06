// ============================================================
// closure-lookup.js — Ricerca chiusure/festività per una data specifica
// Dipende da: closure-date-parser.js, easter-calculator.js
// ============================================================

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
