// ============================================================
// season-countdown-timer.js — Countdown live per il cambio stagione
// Dipende da: timezone-utils.js (getNow verrà sovrascritta a runtime)
// ============================================================

let _countdownInterval = null;

function _avviaCountdownStagione(dataCambio, nomeAttiva, nomeProssima) {
  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }

  const wrapper = document.getElementById("countdown-content-wrapper");
  const testoSpan = document.getElementById("countdown-testo");
  const labelAtt = document.getElementById("countdown-label-attiva");
  const labelPross = document.getElementById("countdown-label-prossima");

  if (!testoSpan || !wrapper) return;

  wrapper.style.visibility = "visible";

  if (labelAtt) {
    labelAtt.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#00FF7F;display:inline-block;flex-shrink:0;"></span> ${nomeAttiva.toUpperCase()}`;
  }
  if (labelPross) {
    labelPross.textContent = `${nomeProssima.toUpperCase()} →`;
  }

  const _tick = () => {
    const diff = dataCambio.getTime() - getNow().getTime();

    if (diff <= 0) {
      const el = document.getElementById("countdown-stagione");
      if (el) el.remove();
      clearInterval(_countdownInterval);
      _countdownInterval = null;
      return;
    }

    const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
    const ore = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((diff % (1000 * 60)) / 1000);

    const parti = [];
    if (giorni > 0) parti.push(`${giorni}g`);
    parti.push(`${String(ore).padStart(2, "0")}h`);
    parti.push(`${String(min).padStart(2, "0")}m`);
    parti.push(`${String(sec).padStart(2, "0")}s`);

    testoSpan.textContent = parti.join("  ");
  };

  _tick();
  _countdownInterval = setInterval(_tick, 1000);
}

function _fermaCountdownStagione() {
  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }
  const el = document.getElementById("countdown-stagione");
  if (el) el.remove();
}

function _getDataCambio(transizione, dataRiferimento) {
  if (!transizione) return null;
  const oggi = new Date(dataRiferimento || getNow());
  oggi.setUTCHours(0, 0, 0, 0);
  const anno = oggi.getUTCFullYear();

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);
    const candidata = new Date(
      transizione.a === "Estivo" ? date.inizioEstivo : date.inizioInvernale,
    );
    candidata.setUTCHours(0, 0, 0, 0);
    if (candidata >= oggi) return candidata;
  }
  return null;
}
