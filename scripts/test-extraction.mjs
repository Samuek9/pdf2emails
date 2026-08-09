// Power test: extrae los correos de public/sample-emails.pdf con pdfjs-dist
// y valida que coincidan con los esperados.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import * as pdfjs from "pdfjs-dist";

const require = createRequire(import.meta.url);
const workerPath = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
pdfjs.GlobalWorkerOptions.workerSrc = new URL(`file://${workerPath.replace(/\\/g, "/")}`).href;

const pdfPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sample-emails.pdf");
const bytes = readFileSync(pdfPath);

const expected = [
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
].sort();

const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
const numPages = pdf.numPages;
let text = "";
for (let i = 1; i <= numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
}
await pdf.destroy();

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const found = [...new Set((text.match(EMAIL_REGEX) ?? []).map((e) => e.toLowerCase()))].sort();

console.log(`numPages: ${numPages}`);
console.log(`Expected: ${expected.length}`);
console.log(`Found:    ${found.length}`);
console.log("Found list:", found);

const missing = expected.filter((e) => !found.includes(e));
const ok = found.length === expected.length && missing.length === 0;
console.log(ok ? "PASS: todos los correos extraidos correctamente." : `FAIL: faltan ${missing.join(", ")}`);
process.exit(ok ? 0 : 1);
