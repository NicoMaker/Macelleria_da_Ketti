// ============================================================
// upcoming-closures.js — Raccoglie TUTTE le chiusure future
// (ferie + festività + Pasqua)
// Dipende da: closure-date-parser.js, easter-calculator.js,
//             time-format-utils.js
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
// ============================================================

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
