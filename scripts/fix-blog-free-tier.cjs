const fs = require("fs");
const base = "c:/Users/Windows/Documents/pdf2emails/src/app/blog/";
const rules = [
  // EN
  ["(up to 5 pages or 50 emails), no signup.", "(up to 5 pages and 50 emails), no signup."],
  ["(up to 5 pages or 50 emails) are free", "(up to 5 pages and 50 emails) are free"],
  ["(up to 5 pages or 50 emails) are 100% free", "(up to 5 pages and 50 emails) are 100% free"],
  // ES
  ["(hasta 5 páginas o 50 correos), sin registro.", "(hasta 5 páginas y 50 correos), sin registro."],
  ["(hasta 5 páginas o 50 correos) son 100% gratis", "(hasta 5 páginas y 50 correos) son 100% gratis"],
  ["(hasta 5 páginas o 50 correos) son gratis", "(hasta 5 páginas y 50 correos) son gratis"],
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
