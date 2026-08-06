// ============================================================
// closure-date-parser.js — Parsing delle voci di chiusura dal JSON
// Dipende da: time-format-utils.js (formatDateDM)
//
// Unico array "chiusure" nel JSON — due formati:
//   { "tipo": "giorno",  "data": "31/10",   "motivo": "" }
//   { "tipo": "periodo", "inizio": "12/02", "fine": "19/02", "motivo": "Pippo" }
//
// Regola motivo:
//   - stringa non vuota → viene mostrata (es. "Chiusura natalizia")
//   - stringa vuota o assente → mostra "Ferie"
//
// Voci con data/inizio/fine vuoti vengono ignorate automaticamente.
// ============================================================

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
