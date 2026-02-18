// ============================================================
// footer-apertura.js — Stato apertura (aperto / in-chiusura / chiuso)
// Dipende da: (nessuna dipendenza esterna, riceve tutto come parametri)
// ============================================================

function checkStatoApertura(orariString, oraCorrente, eChiusoOggi, orariExtraOggi, minutiInChiusura) {
  if (eChiusoOggi && !orariExtraOggi)
    return { stato: "chiuso", minutiAllaChiusura: 0 };

  if (!orariString || orariString.toLowerCase().includes("chiuso"))
    return { stato: "chiuso", minutiAllaChiusura: 0 };

  const orariMatch = orariString.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g);
  if (!orariMatch) return { stato: "chiuso", minutiAllaChiusura: 0 };

  const parseTime = (t) => {
    const [ore, minuti] = t.split(":");
    return Number.parseInt(ore) * 100 + Number.parseInt(minuti);
  };

  const minutiPrimaChiusura = minutiInChiusura || 30;

  for (const range of orariMatch) {
    const [inizio, fine] = range.split("-").map((s) => s.trim());
    const inizioTime = parseTime(inizio);
    const fineTime = parseTime(fine);

    let fineMinuti = Math.floor(fineTime % 100);
    let fineOre = Math.floor(fineTime / 100);

    fineMinuti -= minutiPrimaChiusura;
    if (fineMinuti < 0) {
      fineMinuti += 60;
      fineOre -= 1;
    }
    const inChiusuraTime = fineOre * 100 + fineMinuti;

    if (oraCorrente >= inizioTime && oraCorrente < fineTime) {
      if (oraCorrente >= inChiusuraTime) {
        const oreCorr = Math.floor(oraCorrente / 100);
        const minCorr = oraCorrente % 100;
        const oreFine = Math.floor(fineTime / 100);
        const minFine = fineTime % 100;
        const minutiTotaliCorrente = oreCorr * 60 + minCorr;
        const minutiTotaliFine = oreFine * 60 + minFine;
        const minutiMancanti = minutiTotaliFine - minutiTotaliCorrente;

        return { stato: "in-chiusura", minutiAllaChiusura: minutiMancanti };
      }
      return { stato: "aperto", minutiAllaChiusura: 0 };
    }
  }

  return { stato: "chiuso", minutiAllaChiusura: 0 };
}
