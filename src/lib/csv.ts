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
