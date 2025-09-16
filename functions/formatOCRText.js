export function formatOCRText(text) {
  if (!text) return "";

  // Unificar saltos de línea
  let formatted = text.replace(/\r\n/g, '\n');

  // Máximo dos saltos de línea consecutivos
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Limpiar espacios extra
  formatted = formatted.replace(/[]{2,}/g, ' ');

  // Capitalizar la primera letra de cada oración
  formatted = formatted.split('. ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ');

  return formatted;
}