"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { LATAM_COUNTRIES, ROW_COUNTRIES } from "@/lib/countries";
import { t, detectLocale } from "@/lib/i18n";

const ALL_COUNTRIES = [...LATAM_COUNTRIES, ...ROW_COUNTRIES];

export function Footer() {
  // Estado estable en server y primer render (evita hydration mismatch).
  // El pais real (cookie) se lee despues del montaje.
  const [country, setCountry] = useState("US");
  const router = useRouter();

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("user_country="));
    setCountry(cookie ? cookie.split("=")[1] : "US");
  }, []);

  function handleCountryChange(code: string) {
    setCountry(code);
    document.cookie = `user_country=${code};path=/;max-age=2592000;samesite=lax`;
    // Redirige al idioma coherente con el pais seleccionado (US->en, CO->es, BR->pt, ...).
    const locale = detectLocale(code);
    router.push(`/${locale}`);
  }

  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Mail size={16} className="text-emerald-600" />
          {t("brand")}
          <span className="font-normal text-slate-500">{t("footer.tag", { year: new Date().getFullYear() })}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <label htmlFor="country-demo" className="font-medium">{t("footer.country")}</label>
          <select
            id="country-demo"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ALL_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <div className="flex gap-4">
            <a href="/terms" className="transition hover:text-slate-600">Terms</a>
            <a href="/privacy" className="transition hover:text-slate-600">Privacy</a>
          </div>
          <a href="mailto:soporte@pdf2emails.com" className="transition hover:text-slate-600">soporte@pdf2emails.com</a>
        </div>
      </div>
    </footer>
  );
}