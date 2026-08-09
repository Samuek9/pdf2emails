import { readFileSync, writeFileSync } from "node:fs";

// Mejora contraste a11y: slate-400 (#94a3b8, ~2.4:1) -> slate-500 (#64748b, ~4.6:1)
const files = ["src/components/ResultsPanel.tsx", "src/components/Footer.tsx"];
for (const f of files) {
  const s = readFileSync(f, "utf8");
  const out = s.split("text-slate-400").join("text-slate-500");
  if (out !== s) {
    writeFileSync(f, out);
    console.log("updated", f);
  } else {
    console.log("no change", f);
  }
}
