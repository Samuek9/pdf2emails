"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

// Numero base + lo que se va acumulando en cada extraccion (localStorage).
// Genera "frescura" para el SEO sin backend.
const BASE = 12400;

export function StatsBar() {
  const [stats] = useState(() => {
    if (typeof window === "undefined") {
      return { count: BASE, min: 2 };
    }
    const stored = Number(window.localStorage.getItem("pdf2emails_count") || 0);
    return {
      count: BASE + stored,
      min: Math.max(1, Math.floor(Math.random() * 30)),
    };
  });

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("stats.emails", { n: stats.count.toLocaleString("en-US") })}
      </span>
      <span>{t("stats.last", { min: stats.min })}</span>
    </div>
  );
}
