const fs = require("fs");
const base = "c:/Users/Windows/Documents/pdf2emails/src/app/blog/";
const rules = [
  // EN
  ["First 5 emails free, no signup.", "Free for small PDFs (up to 5 pages or 50 emails), no signup."],
  ["First 5 emails are free, no signup.", "Small PDFs (up to 5 pages or 50 emails) are free, no signup."],
  ["Review the first 5 emails free.", "Review the emails — small PDFs (up to 5 pages or 50 emails) are 100% free."],
  // ES
  ["Primeros 5 correos gratis, sin registro.", "Gratis para PDFs pequeños (hasta 5 páginas o 50 correos), sin registro."],
  ["Los primeros 5 correos son gratis, sin registro.", "Los PDFs pequeños (hasta 5 páginas o 50 correos) son gratis, sin registro."],
  ["Revisa los primeros 5 correos gratis.", "Revisa los correos — los PDFs pequeños (hasta 5 páginas o 50 correos) son 100% gratis."],
];
const files = fs.readdirSync(base).filter((f) => {
  return fs.existsSync(base + f + "/page.tsx");
});
for (const file of files) {
  const p = base + file + "/page.tsx";
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, "utf8");
  let n = 0;
  for (const [a, b] of rules) {
    if (c.includes(a)) {
      c = c.split(a).join(b);
      n += 1;
    }
  }
  if (n > 0) {
    fs.writeFileSync(p, c);
    console.log(file, "updated", n);
  }
}
