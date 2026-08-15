// ============================================================
// season-calculator.js — Cambio stagione orari (estivo/invernale)
// Dipende da: timezone-utils.js, time-format-utils.js
// ============================================================

function ultimaDomenica(anno, mese) {
  const ultimo = new Date(Date.UTC(anno, mese, 0, 0, 0, 0, 0));
  while (ultimo.getDay() !== 0) {
    ultimo.setDate(ultimo.getDate() - 1);
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
  fineEstivo.setDate(fineEstivo.getDate() - 1);
  const fineInvernale = new Date(ultimaDomEstivo.getTime());
  fineInvernale.setDate(fineInvernale.getDate() - 1);
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
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    const stagEstiva = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "estivo",
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

    const stagInvernale = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "invernale",
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
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();
  const isEstivo = stagione.nome && stagione.nome.toLowerCase() === "estivo";
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

function getRilevaTransizioneStagione(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (stagioni.length < 2) return null;

  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();
  const fine7gg = new Date(oggi);
  fine7gg.setDate(fine7gg.getDate() + 6);
  fine7gg.setHours(0, 0, 0, 0);

  const diffGiorni = (dateA, dateB) =>
    Math.round((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    const iniEst = new Date(date.inizioEstivo);
    iniEst.setHours(0, 0, 0, 0);
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
    iniInv.setHours(0, 0, 0, 0);
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
