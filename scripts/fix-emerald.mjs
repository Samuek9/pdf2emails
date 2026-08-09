import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Contraste: emerald-600 (#059669, ~3.8:1) -> emerald-700 (#047857, ~5.5:1) en texto/links.
const targets = [
  "src/app/blog",
  "src/app/use-cases",
  "src/app/[lang]/blog",
  "src/app/[lang]/use-cases",
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(p)) out.push(p);
  }
  return out;
}

const files = new Set(["src/app/[lang]/page.tsx"]);
for (const d of targets) for (const f of walk(d)) files.add(f);

let changed = 0;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  const out = s.split("text-emerald-600").join("text-emerald-700");
  if (out !== s) {
    writeFileSync(f, out);
    changed++;
    console.log("updated", f);
  }
}
console.log("archivos cambiados:", changed);
