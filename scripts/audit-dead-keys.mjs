import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Claves definidas en es.ts que NO se usan via t("...") en src -> copy/feature stale.
const es = readFileSync("src/lib/i18n/es.ts", "utf8");
const defined = [...es.matchAll(/"([a-zA-Z0-9_.]+)"\s*:/g)].map((m) => m[1]);

function walk(dir) {
  let files = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(p));
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
  }
  return files;
}

const allSrc = [...walk("src"), "next.config.mjs"].filter((p) => !p.includes("/i18n/"));
const body = allSrc.map((p) => readFileSync(p, "utf8")).join("\n");

const unused = defined.filter((k) => !body.includes(`"${k}"`));
console.log("Definidas en es.ts:", defined.length);
console.log("Claves definidas pero NO usadas en el codigo (dead keys):");
for (const k of unused) console.log("  -", k);
