const fs = require("fs");
const dir = "c:/Users/Windows/Documents/pdf2emails/src/lib/i18n/";
const rules = [
  ["3 pages or 10 emails", "5 pages or 50 emails"],
  ["3 páginas o 10 correos", "5 páginas o 50 correos"],
  ["3 páginas ou 10 emails", "5 páginas ou 50 emails"],
  ["3 pages ou 10 emails", "5 pages ou 50 emails"],
  ["3 Seiten oder 10 E-Mails", "5 Seiten oder 50 E-Mails"],
  ["10 emails max", "50 emails max"],
  ["10 E-Mails", "50 E-Mails"],
  ["hasta 10 correos", "hasta 50 correos"],
  ["até 10 emails", "até 50 emails"],
  ["de 10 emails max", "de 50 emails max"],
  ["up to 10 emails", "up to 50 emails"],
  ["de até 10 emails", "de até 50 emails"],
  ["first 10 emails", "first 50 emails"],
  ["primeros 10 correos", "primeros 50 correos"],
  ["de 10 emails", "de 50 emails"],
  ["10 emails", "50 emails"],
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
