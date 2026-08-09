export function toCsv(emails: string[], includeHeader = true): string {
  const header = includeHeader ? "email\n" : "";
  return header + emails.map((email) => email).join("\n") + "\n";
}

export function toTxt(emails: string[]): string {
  return emails.join("\n") + "\n";
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
  const rows = [["email"], ...emails.map((e) => [e])];
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

