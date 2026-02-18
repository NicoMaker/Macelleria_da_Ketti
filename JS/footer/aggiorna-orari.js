// ============================================================
// aggiorna-orari.js — Aggiornamento live della lista orari
// Dipende da: date-utils.js, Gestisci_chiusure.js, gestisci_apertura.js
// ============================================================

function aggiornaColoreOrari(data) {
  const orari = data.orari || [];
  const legenda = data.legendaOrari || { colori: {}, testo: {} };

  if (!orari.length) return;

  const oggiReal = new Date();
  const oggi = new Date(oggiReal);
  oggi.setHours(0, 0, 0, 0);
  const giornoSettimana = oggiReal.getDay();
  const oraCorrente = oggiReal.getHours() * 100 + oggiReal.getMinutes();
  const indiceGiornoCorrente = giornoSettimana === 0 ? 6 : giornoSettimana - 1;

  // Orari attivi: stagionali se presenti, altrimenti base
  const { orari: orariAttivi, nomeStagione } = getOrariAttiviOggi(
    data,
    oggiReal,
  );

  const unifiedFerieDates = getUnifiedFerieDates(data, oggi.getFullYear());
  const unifiedFerieDatesNextYear = getUnifiedFerieDates(
    data,
    oggi.getFullYear() + 1,
  );

  const dataOggiFormattata = formatDateDM(oggiReal);
  const orariExtraOggi = getOrariExtraForDate(
    data,
    dataOggiFormattata,
    giornoSettimana,
  );

  const singleDayClosure = getSingleDayClosureReason(
    oggiReal,
    data,
    unifiedFerieDates,
    unifiedFerieDatesNextYear,
  );
  const isFestivita =
    singleDayClosure && singleDayClosure.reason === "festivita";
  const eFerieOggi = singleDayClosure && singleDayClosure.reason === "ferie";
  const isMotivoExtra =
    singleDayClosure && singleDayClosure.reason === "motivi-extra";

  let eChiusoOggi = isFestivita || eFerieOggi || isMotivoExtra;

  const orariDaUsareOggi = orariExtraOggi || orariAttivi[indiceGiornoCorrente];
  if (orariExtraOggi) eChiusoOggi = false;

  const statoApertura = checkStatoApertura(
    orariDaUsareOggi,
    oraCorrente,
    eChiusoOggi,
    orariExtraOggi,
    data.minutiInChiusura,
  );

  // Prossimi 7 giorni
  const giorniDaVisualizzare = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    d.setHours(0, 0, 0, 0);
    giorniDaVisualizzare.push(d);
  }

  // ── Aggiorna lista orari ─────────────────────────────────
  const lista = document.querySelector("#orari-footer");
  if (!lista) return;

  lista.innerHTML = giorniDaVisualizzare
    .map((dataDelGiorno, i) => {
      let colore = "";
      let peso = "";

      const dayOfWeek = dataDelGiorno.getDay();
      const orariIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const dataFmt = formatDateDM(dataDelGiorno);
      const nomeGiorno = data.nomiGiorni[dayOfWeek];
      const orariExtraGiorno = getOrariExtraForDate(data, dataFmt, dayOfWeek);

      // Per ogni giorno usa la stagione corretta
      const { orari: orariGiorno } = getOrariAttiviOggi(data, dataDelGiorno);

      let testoOrario;

      if (orariExtraGiorno) {
        testoOrario = orariExtraGiorno;
      } else {
        testoOrario = orariGiorno[orariIndex];
        const closureCheck = getSingleDayClosureReason(
          dataDelGiorno,
          data,
          unifiedFerieDates,
          unifiedFerieDatesNextYear,
        );
        if (closureCheck && closureCheck.reason === "festivita") {
          testoOrario = `${nomeGiorno}: Chiuso (Festività)`;
        } else if (closureCheck && closureCheck.reason === "ferie") {
          const motivo = closureCheck.motivoSpecifico || "Ferie";
          testoOrario = `${nomeGiorno}: Chiuso (${motivo}) fino al ${closureCheck.dataChiusura}`;
        } else if (closureCheck && closureCheck.reason === "motivi-extra") {
          testoOrario = `${nomeGiorno}: Chiuso (${closureCheck.motivoSpecifico})`;
        }
      }

      if (i === 0) {
        peso = "font-weight:bold;";
        if (eChiusoOggi || statoApertura.stato === "chiuso") {
          colore = legenda.colori.chiuso || "orange";
        } else if (statoApertura.stato === "in-chiusura") {
          colore = legenda.colori["in chiusura"] || "#FFD700";
          const minuti = statoApertura.minutiAllaChiusura;
          testoOrario += ` (${minuti} ${minuti === 1 ? "minuto" : "minuti"})`;
        } else {
          colore = legenda.colori.aperto || "#00FF7F";
        }
      }

      return `<li class="footer-item" style="color:${colore};${peso}">${testoOrario}</li>`;
    })
    .join("");

  // ── Aggiorna titolo orari ────────────────────────────────
  // "Orario Estivo" / "Orario Invernale" / "Orari"
  const titoloEl = document.getElementById("titolo-orari");
  if (titoloEl) {
    titoloEl.textContent = nomeStagione ? `Orario ${nomeStagione}` : "Orario";
  }

  // ── Aggiorna testo in-chiusura nella legenda ─────────────
  const testoInChiusuraSpan = document.getElementById("testo-in-chiusura");
  if (testoInChiusuraSpan) {
    if (statoApertura.stato === "in-chiusura") {
      const minuti = statoApertura.minutiAllaChiusura;
      testoInChiusuraSpan.textContent = `In chiusura tra ${minuti} ${minuti === 1 ? "minuto" : "minuti"}`;
    } else {
      testoInChiusuraSpan.textContent =
        legenda.testo["in chiusura"] || "In chiusura";
    }
  }

  // ── Aggiorna descrizione stagioni nella legenda ───────────
  const descEl = document.getElementById("descrizione-stagione");
  if (descEl) {
    const stagioni = data.orariStagionali || [];
    const stagioneAttiva = getStagioneAttiva(data, oggiReal);

    if (!stagioni.length || !stagioni.filter((s) => s.nome).length) {
      descEl.style.display = "none";
    } else {
      const annoOggi = oggiReal.getFullYear();
      const _testo = (s) => {
        const _label = (ddmm) => {
          if (!ddmm) return "";
          const minusOne = ddmm.endsWith("-1");
          const base = minusOne ? ddmm.slice(0, -2) : ddmm;
          let d;
          if (base === "auto-marzo") d = ultimaDomenica(annoOggi, 3);
          else if (base === "auto-ottobre") d = ultimaDomenica(annoOggi, 10);
          else return ddmm;
          if (minusOne) d.setDate(d.getDate() - 1);
          return formatDateDM(d);
        };
        let t = `Orario ${s.nome}`;
        const ini = _label(s.inizio);
        const fin = _label(s.fine);
        if (ini && fin) t += `: dal ${ini} al ${fin}`;
        else if (ini) t += `: dal ${ini}`;
        else if (fin) t += `: fino al ${fin}`;
        return t;
      };
      descEl.style.marginTop = "14px";
      descEl.innerHTML = [...stagioni]
        .filter((s) => s.nome)
        .sort((a, b) => _ddmmToSortKey(a.inizio) - _ddmmToSortKey(b.inizio))
        .map((s) => {
          const isAttiva = stagioneAttiva && stagioneAttiva.nome === s.nome;
          return `<div style="${isAttiva ? "font-weight:bold;" : "opacity:0.65;"}">${_testo(s)}</div>`;
        })
        .join("");
      descEl.style.display = "";
    }
  }
}
