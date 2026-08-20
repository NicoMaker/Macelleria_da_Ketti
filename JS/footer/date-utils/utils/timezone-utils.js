// ============================================================
// timezone-utils.js — Utility per il fuso orario del negozio
// ============================================================

// ── Variabile per il fuso orario del negozio ──
let _shopTimezone = "Europe/London";

function configuraTimezone(data) {
  if (data && data.timezone) {
    _shopTimezone = data.timezone;
  }
}

// Offset del negozio (in minuti) calcolato per una data specifica.
// Passare una data di riferimento serve per gestire correttamente
// i cambi di ora legale sui giorni futuri.
function getShopOffsetMinutesForDate(refDate) {
  const now = refDate || new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: _shopTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const obj = {};
  parts.forEach((p) => {
    obj[p.type] = p.value;
  });
  const localDate = new Date(
    Date.UTC(
      parseInt(obj.year),
      parseInt(obj.month) - 1,
      parseInt(obj.day),
      parseInt(obj.hour),
      parseInt(obj.minute),
      parseInt(obj.second),
    ),
  );
  return (localDate.getTime() - now.getTime()) / 60000;
}

function getShopOffsetMinutes() {
  return getShopOffsetMinutesForDate(new Date());
}

function getShopNow() {
  const offset = getShopOffsetMinutes();
  return new Date(Date.now() + offset * 60000);
}

function getUserNow() {
  return new Date();
}

// Differenza (in ore) tra fuso negozio e fuso utente per una data specifica.
// getTimezoneOffset() sulla data giusta tiene conto dell'ora legale dell'utente.
function getTimezoneOffsetHoursForDate(refDate) {
  const d = refDate || new Date();
  const shopOffset = getShopOffsetMinutesForDate(d);
  const userOffset = -d.getTimezoneOffset();
  return (shopOffset - userOffset) / 60;
}

function getTimezoneOffsetHours() {
  return getTimezoneOffsetHoursForDate(new Date());
}
