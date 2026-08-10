const fs = require("fs");
const dir = "c:/Users/Windows/Documents/pdf2emails/src/lib/i18n/";
const rules = [
  ["(5 pages or 50 emails)", "(up to 5 pages and 50 emails)"],
  ["(5 páginas o 50 correos)", "(hasta 5 páginas y 50 correos)"],
  ["(5 páginas ou 50 emails)", "(até 5 páginas e 50 emails)"],
  ["(5 pages ou 50 emails)", "(jusqu'à 5 pages et 50 emails)"],
  ["(5 Seiten oder 50 E-Mails)", "(bis 5 Seiten und 50 E-Mails)"],
  ["PDFs up to 5 pages or 50 emails", "PDFs up to 5 pages and 50 emails"],
  ["PDFs hasta 5 páginas o 50 correos", "PDFs hasta 5 páginas y 50 correos"],
  ["PDFs até 5 páginas ou 50 emails", "PDFs até 5 páginas e 50 emails"],
  ["PDFs jusqu'à 5 pages ou 50 emails", "PDFs jusqu'à 5 pages et 50 emails"],
  ["PDFs bis 5 Seiten oder 50 E-Mails", "PDFs bis 5 Seiten und 50 E-Mails"],
  ["PDFs up to 5 pages or 50 emails are extracted", "PDFs up to 5 pages and 50 emails are extracted"],
  ["PDFs de hasta 5 páginas o 50 correos se extraen", "PDFs de hasta 5 páginas y 50 correos se extraen"],
  ["PDFs de até 5 páginas ou 10 emails são extraídos", "PDFs de até 5 páginas e 50 emails são extraídos"],
  ["PDFs de até 5 páginas ou 50 emails são extraídos", "PDFs de até 5 páginas e 50 emails são extraídos"],
  ["PDFs de 5 pages ou 50 emails max sont extraits", "PDFs de 5 pages et 50 emails max sont extraits"],
  ["PDFs bis 5 Seiten oder 50 E-Mails werden 100% kostenlos", "PDFs bis 5 Seiten und 50 E-Mails werden 100% kostenlos"],
];
for (const f of ["es.ts", "en.ts", "pt.ts", "fr.ts", "de.ts"]) {
  let c = fs.readFileSync(dir + f, "utf8");
  let n = 0;
  for (const [a, b] of rules) {
    const count = c.split(a).length - 1;
    if (count > 0) {
      c = c.split(a).join(b);
      n += count;
    }
  }
  fs.writeFileSync(dir + f, c);
  console.log(f, "replaced", n);
}
