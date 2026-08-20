// ============================================================
// whatsapp-link.js — Genera il link WhatsApp dal numero di telefono
// ============================================================

function getWhatsappURL(contatti) {
  if (!contatti || !contatti.telefono) return null;
  const numSoloCifre = contatti.telefono.replace(/[^\d]/g, "");
  return `https://wa.me/${numSoloCifre}`;
}
