import { readFileSync } from "node:fs";

const files = {
  es: "src/lib/i18n/es.ts",
  en: "src/lib/i18n/en.ts",
  pt: "src/lib/i18n/pt.ts",
  fr: "src/lib/i18n/fr.ts",
  de: "src/lib/i18n/de.ts",
};

function keys(p) {
  const s = readFileSync(p, "utf8");
  const m = [...s.matchAll(/"([a-zA-Z0-9_.]+)"\s*:/g)];
  return new Set(m.map((x) => x[1]));
}

const ks = {};
for (const [l, p] of Object.entries(files)) ks[l] = keys(p);
const all = new Set();
for (const l of Object.keys(files)) for (const k of ks[l]) all.add(k);

let missingCount = 0;
for (const k of all) {
  const missing = Object.entries(files)
    .filter(([l]) => !ks[l].has(k))
    .map(([l]) => l);
  if (missing.length) {
    missingCount++;
    console.log("MISSING", k, "in", missing.join(","));
  }
}
console.log("total keys:", all.size, "| keys missing in at least one locale:", missingCount);
