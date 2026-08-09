import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Contraste de botones/badges: emerald-600 (#059669, ~3.8:1) -> emerald-700 (#047857, ~5.5:1)
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(p)) out.push(p);
  }
  return out;
}

const files = walk("src");
let changed = 0;
for (const f of files) {
  let s = readFileSync(f, "utf8");
  const out = s.split("bg-emerald-600").join("bg-emerald-700").split("shadow-emerald-600/20").join("shadow-emerald-700/20");
  if (out !== s) {
    writeFileSync(f, out);
    changed++;
  }
}
console.log("archivos con cambios:", changed);
