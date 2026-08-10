"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

/**
 * Muestra cuantos correos extrajo ESTE navegador (localStorage), no un total
 * global de la plataforma. Antes sumaba un BASE=12400 inventado a ese
 * numero para simular actividad de toda la plataforma sin tener backend que
 * la respalde — eso es un dato falso, no "frescura SEO". No se renderiza
 * nada hasta que haya un numero real que mostrar.
 */
export function StatsBar() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    try {
      setCount(Number(window.localStorage.getItem("pdf2emails_count") || 0));
    } catch {
      // noop
    }
  }, []);

  if (count <= 0) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("stats.emails", { n: count.toLocaleString("en-US") })}
      </span>
    </div>
  );
}
