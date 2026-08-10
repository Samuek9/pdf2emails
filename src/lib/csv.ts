/**
 * Neutraliza inyeccion de formulas CSV/XLSX (OWASP CSV Injection): un email
 * extraido de un PDF puede empezar con "=", "+", "-" o "@" (ej. un telefono
 * "+573001234567juan@empresa.com" pegado sin espacio al email en el PDF
 * original), y Excel/Sheets interpretan esos caracteres al inicio de una
 * celda como el arranque de una formula. Anteponer un apostrofe fuerza a que
 * se trate como texto literal.
 */
function sanitizeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvField(value: string): string {
  const v = sanitizeCell(value);
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(emails: string[], includeHeader = true): string {
  const header = includeHeader ? "email\n" : "";
  return header + emails.map(csvField).join("\n") + "\n";
}

export function toTxt(emails: string[]): string {
  return emails.join("\n") + "\n";
}

/**
 * Copia texto al portapapeles de forma robusta. El API moderno
 * (navigator.clipboard) requiere gesto de usuario activo y permiso, y puede
 * rechazar en modals/iframes; por eso cae a execCommand como fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // falla -> intenta fallback
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function downloadBlob(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Exporta una lista de emails a un archivo Excel (.xlsx) en el navegador. */
export async function downloadXlsx(emails: string[]): Promise<void> {
  const xlsx = await import("xlsx");
  const rows = [["email"], ...emails.map((e) => [sanitizeCell(e)])];
  const ws = xlsx.utils.aoa_to_sheet(rows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "emails");
  const out = xlsx.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "emails.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

