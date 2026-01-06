/**
 * Formatta un numero di telefono italiano
 * @param {string} phoneNumber - Numero di telefono (es: "+393357802124")
 * @returns {string} - Numero formattato (es: "+39 335 780 2124")
 */
function formatPhoneNumber(phoneNumber) {
  // Rimuove tutti gli spazi esistenti
  const cleaned = phoneNumber.replace(/\s/g, "")

  // Formato italiano: +39 XXX XXX XXXX
  if (cleaned.startsWith("+39")) {
    const prefix = "+39"
    const rest = cleaned.substring(3)

    // Divide in gruppi: 3-3-4 oppure 3-4-3 a seconda della lunghezza
    if (rest.length === 10) {
      return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`
    } else if (rest.length === 9) {
      return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 7)} ${rest.substring(7)}`
    }
  }

  // Se non corrisponde al formato, ritorna l'originale
  return phoneNumber
}

// Esporta la funzione per usarla in altri file
if (typeof module !== "undefined" && module.exports) {
  module.exports = { formatPhoneNumber }
}
