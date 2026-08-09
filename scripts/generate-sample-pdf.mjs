// Genera public/sample-emails.pdf (un PDF valido con correos de ejemplo).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sample-emails.pdf");

const emails = [
  "john.doe@acmecorp.com",
  "maria@startup.co",
  "info@example.com",
  "support@acme.com",
  "juan@gmail.com",
  "carolina@empresa.com.co",
  "ventas@comercial.io",
  "pedro@hotmail.com",
  "ana@logistica.co",
  "contacto@distribuidora.com",
  "proveedores@industria.co",
  "luis@outlook.com",
];

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const lines = [
  "PDF2Emails - PDF de ejemplo con correos",
  "========================================",
  "",
  ...emails,
];

const contentStream =
  `BT /F1 12 Tf 50 740 Td 16 TL\n` +
  lines.map((l) => `(${esc(l)}) Tj T*`).join("\n") +
  `\nET`;

const objects = [];
objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
objects[3] =
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>";
objects[4] = `<< /Length ${Buffer.byteLength(contentStream, "ascii")} >>\nstream\n${contentStream}\nendstream`;
objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let i = 1; i <= 5; i++) {
  offsets[i] = Buffer.byteLength(pdf, "ascii");
  pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefStart = Buffer.byteLength(pdf, "ascii");
pdf += `xref\n0 6\n0000000000 65535 f \n`;
for (let i = 1; i <= 5; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

writeFileSync(out, pdf, "ascii");
console.log(`Sample PDF written to ${out} (${pdf.length} bytes)`);
