const fs = require("fs");
const dir = "c:/Users/Windows/Documents/pdf2emails/src/lib/i18n/";
const rules = [
  ["checkout.latamPpp\": \"Precio LATAM (PPP)\"", "checkout.latamPpp\": \"Precio local estimado\""],
  ["checkout.latamPpp\": \"LATAM price (PPP)\"", "checkout.latamPpp\": \"Estimated local price\""],
  ["checkout.latamPpp\": \"Preço LATAM (PPP)\"", "checkout.latamPpp\": \"Preço local estimado\""],
  ["checkout.latamPpp\": \"Prix LATAM (PPP)\"", "checkout.latamPpp\": \"Prix local estimé\""],
  ["checkout.latamPpp\": \"LATAM-Preis (PPP)\"", "checkout.latamPpp\": \"Geschätzter lokaler Preis\""],
];
for (const f of ["es.ts", "en.ts", "pt.ts", "fr.ts", "de.ts"]) {
  let c = fs.readFileSync(dir + f, "utf8");
  let n = 0;
  for (const [a, b] of rules) {
    const count = c.split(a).length - 1;
    if (count > 0) { c = c.split(a).join(b); n += count; }
  }
  fs.writeFileSync(dir + f, c);
  console.log(f, n);
}
