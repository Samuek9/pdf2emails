"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

// Numero base + lo que se va acumulando en cada extraccion (localStorage).
// Genera "frescura" para el SEO sin backend.
const BASE = 12400;

export function StatsBar() {
  // Contador de emails extraidos (frescura SEO). Sin ticker de "ultima extraccion"
  // (daba impresion de poco trafico cuando el tiempo crecia).
  const [count, setCount] = useState<number>(BASE);

  useEffect(() => {
    let stored = 0;
    try {
      stored = Number(window.localStorage.getItem("pdf2emails_count") || 0);
    } catch {
      // noop
    }
    setCount(BASE + stored);
  }, []);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("stats.emails", { n: count.toLocaleString("en-US") })}
      </span>
    </div>
  );
}
