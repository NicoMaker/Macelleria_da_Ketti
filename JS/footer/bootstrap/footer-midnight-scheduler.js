// ============================================================
// footer-midnight-scheduler.js — Refresh automatico del footer a mezzanotte
// Dipende da: footer-clock.js, footer-rebuild.js
// ============================================================

function scheduleFooterRefreshAtMidnight(data) {
  const now = getNow();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  console.log(
    `Prossimo aggiornamento footer schedulato tra ${Math.round(
      msUntilMidnight / 1000 / 60,
    )} minuti`,
  );

  setTimeout(() => {
    _ricostruisciFooter(data);
    setInterval(() => _giroAlMinuto(data), 60000);
    scheduleFooterRefreshAtMidnight(data);
  }, msUntilMidnight);
}
