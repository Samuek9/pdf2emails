"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

// Numero base + lo que se va acumulando en cada extraccion (localStorage).
// Genera "frescura" para el SEO sin backend.
const BASE = 12400;

export function StatsBar() {
  // Estado estable (igual en server y primer render del cliente) para evitar
  // hydration mismatch. Los valores dependientes de localStorage/random se
  // actualizan despues del montaje.
  const [stats, setStats] = useState<{ count: number; min: number }>({ count: BASE, min: 2 });

  useEffect(() => {
    let stored = 0;
    try {
      stored = Number(window.localStorage.getItem("pdf2emails_count") || 0);
    } catch {
      // noop
    }
    setStats({
      count: BASE + stored,
      min: Math.max(1, Math.floor(Math.random() * 30)),
    });
  }, []);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("stats.emails", { n: stats.count.toLocaleString("en-US") })}
      </span>
      <span>{t("stats.last", { min: stats.min })}</span>
    </div>
  );
}
