// ============================================================
// footer-apertura.js — Stato apertura (in-apertura / aperto / in-chiusura / chiuso)
// Dipende da: (nessuna dipendenza esterna, riceve tutto come parametri)
// ============================================================

function checkStatoApertura(
  orariString,
  oraCorrente,
  eChiusoOggi,
  orariExtraOggi,
  minutiInChiusura,
) {
  if (eChiusoOggi && !orariExtraOggi)
    return { stato: "chiuso", minutiAllaApertura: 0, minutiAllaChiusura: 0 };

  if (!orariString || orariString.toLowerCase().includes("chiuso"))
    return { stato: "chiuso", minutiAllaApertura: 0, minutiAllaChiusura: 0 };

  // Estrae tutti gli orari nel formato HH:MM - HH:MM (con spazi opzionali)
  const orariMatch = orariString.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g);
  if (!orariMatch || orariMatch.length === 0) {
    return { stato: "chiuso", minutiAllaApertura: 0, minutiAllaChiusura: 0 };
  }

  const parseTime = (t) => {
    const [ore, minuti] = t.split(":");
    return Number.parseInt(ore) * 100 + Number.parseInt(minuti);
  };

  const minutiPrimaChiusura = minutiInChiusura || 30;
  const minutiPrimaApertura = minutiInChiusura || 30; // Stesso valore per apertura

  for (const range of orariMatch) {
    const [inizio, fine] = range.split("-").map((s) => s.trim());
    const inizioTime = parseTime(inizio);
    const fineTime = parseTime(fine);

    // ── Calcola il tempo di "in-apertura" (30 min prima dell'apertura) ───
    let inizioMinuti = Math.floor(inizioTime % 100);
    let inizioOre = Math.floor(inizioTime / 100);

    inizioMinuti -= minutiPrimaApertura;
    if (inizioMinuti < 0) {
      inizioMinuti += 60;
      inizioOre -= 1;
    }
    const inAperturaTime = inizioOre * 100 + inizioMinuti;

    // ── Calcola il tempo di "in-chiusura" (30 min prima della chiusura) ───
    let fineMinuti = Math.floor(fineTime % 100);
    let fineOre = Math.floor(fineTime / 100);

    fineMinuti -= minutiPrimaChiusura;
    if (fineMinuti < 0) {
      fineMinuti += 60;
      fineOre -= 1;
    }
    const inChiusuraTime = fineOre * 100 + fineMinuti;

    // ── Siamo in "in-apertura"? (30 min prima dell'apertura) ───
    if (oraCorrente >= inAperturaTime && oraCorrente < inizioTime) {
      const oreCorr = Math.floor(oraCorrente / 100);
      const minCorr = oraCorrente % 100;
      const oreInizio = Math.floor(inizioTime / 100);
      const minInizio = inizioTime % 100;
      const minutiTotaliCorrente = oreCorr * 60 + minCorr;
      const minutiTotaliInizio = oreInizio * 60 + minInizio;
      const minutiMancanti = minutiTotaliInizio - minutiTotaliCorrente;

      return { 
        stato: "in-apertura", 
        minutiAllaApertura: minutiMancanti, 
        minutiAllaChiusura: 0 
      };
    }

    // ── Siamo aperti? ───
    if (oraCorrente >= inizioTime && oraCorrente < fineTime) {
      // ── Siamo in "in-chiusura"? ───
      if (oraCorrente >= inChiusuraTime) {
        const oreCorr = Math.floor(oraCorrente / 100);
        const minCorr = oraCorrente % 100;
        const oreFine = Math.floor(fineTime / 100);
        const minFine = fineTime % 100;
        const minutiTotaliCorrente = oreCorr * 60 + minCorr;
        const minutiTotaliFine = oreFine * 60 + minFine;
        const minutiMancanti = minutiTotaliFine - minutiTotaliCorrente;

        return { 
          stato: "in-chiusura", 
          minutiAllaApertura: 0, 
          minutiAllaChiusura: minutiMancanti 
        };
      }
      return { 
        stato: "aperto", 
        minutiAllaApertura: 0, 
        minutiAllaChiusura: 0 
      };
    }
  }

  return { 
    stato: "chiuso", 
    minutiAllaApertura: 0, 
    minutiAllaChiusura: 0 
  };
}