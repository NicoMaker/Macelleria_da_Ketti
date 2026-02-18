// ============================================================
// footer-chiusure.js — Logica chiusure (ferie, festività, extra)
// Dipende da: footer-date-utils.js
// ============================================================

function getUnifiedFerieDates(data, year) {
  const unifiedDates = new Set();
  const giorniExtraFerie =
    (data.giorniChiusuraExtra && data.giorniChiusuraExtra.ferie) || [];

  giorniExtraFerie.forEach((date) => unifiedDates.add(date));

  const parseDate = (dateStr, y) => {
    const [day, month] = dateStr.split("/").map(Number);
    return new Date(y, month - 1, day, 0, 0, 0, 0);
  };

  const feriePeriods = data.ferie || [];
  for (const period of feriePeriods) {
    if (!period.inizio || !period.fine) continue;

    const dataInizio = parseDate(period.inizio, year);
    let dataFine = parseDate(period.fine, year);

    if (dataInizio.getTime() > dataFine.getTime()) {
      dataFine = parseDate(period.fine, year + 1);
    }

    const currentDate = new Date(dataInizio);
    while (currentDate.getTime() <= dataFine.getTime()) {
      unifiedDates.add(formatDateDM(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return unifiedDates;
}

function findConsecutiveClosureEnd(startDate, unifiedFerieDates) {
  const startDateDM = formatDateDM(startDate);

  if (!unifiedFerieDates.has(startDateDM)) {
    return startDateDM;
  }

  const currentDate = new Date(startDate);
  let endDate = new Date(startDate);

  while (true) {
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateDM = formatDateDM(currentDate);

    if (!unifiedFerieDates.has(nextDateDM)) {
      return formatDateDM(endDate);
    }

    endDate = new Date(currentDate);
  }
}

function getMotivoExtraForDate(data, dataFormattata) {
  const motiviExtra = data.giorniChiusuraExtra?.["motivi-extra"] || [];

  for (const item of motiviExtra) {
    if (item.giorno === dataFormattata && item.giorno !== "") {
      return item.motivo || "Motivi Extra";
    }
  }
  return null;
}

function getOrariExtraForDate(data, dataFormattata, dayOfWeek) {
  const orariExtra = data.orariExtra || [];
  const nomiGiorni = data.nomiGiorni;

  for (const item of orariExtra) {
    if (item.giorno === dataFormattata && item.orari) {
      const nomeGiorno = nomiGiorni[dayOfWeek];
      return `${nomeGiorno}: ${item.orari} (${item.motivo})`;
    }
  }
  return null;
}

function getSingleDayClosureReason(
  checkDate,
  data,
  unifiedFerieDates,
  unifiedFerieDatesNextYear = null
) {
  const festivita = data.festivita || [];

  // Calcola le date pasquali per l'anno corrente
  const annoCorrente = checkDate.getFullYear();
  const datePasqualiCorrente = getDatePasquali(annoCorrente);

  // Crea un array con tutte le festività incluse Pasqua e Pasquetta
  const festivitaComplete = [
    ...festivita,
    datePasqualiCorrente.pasqua,
    datePasqualiCorrente.pasquetta,
  ];

  const dateToCheck = new Date(checkDate);
  const dataFormattata = formatDateDM(dateToCheck);

  if (festivitaComplete.includes(dataFormattata)) {
    return { reason: "festivita", dataChiusura: dataFormattata };
  }

  if (unifiedFerieDates.has(dataFormattata)) {
    const fineChiusura = findConsecutiveClosureEnd(dateToCheck, unifiedFerieDates);
    return { reason: "ferie", dataChiusura: fineChiusura };
  }

  if (unifiedFerieDatesNextYear && unifiedFerieDatesNextYear.has(dataFormattata)) {
    const fineChiusura = findConsecutiveClosureEnd(dateToCheck, unifiedFerieDatesNextYear);
    return { reason: "ferie", dataChiusura: fineChiusura };
  }

  const motivoExtra = getMotivoExtraForDate(data, dataFormattata);
  if (motivoExtra) {
    return {
      reason: "motivi-extra",
      dataChiusura: dataFormattata,
      motivoSpecifico: motivoExtra,
    };
  }

  return null;
}
