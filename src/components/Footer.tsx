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
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("user_country="));
    setCountry(cookie ? cookie.split("=")[1] : "US");
    setYear(new Date().getFullYear());
  }, []);

  function handleCountryChange(code: string) {
    setCountry(code);
    document.cookie = `user_country=${code};path=/;max-age=2592000;samesite=lax`;
    // Redirige al idioma coherente con el pais (US->en, CO->es, BR->pt...).
    // Incluye ?c= para que la moneda local se actualice aunque el idioma no cambie
    // (p.ej. Chile -> Ecuador, ambos /es).
    const locale = detectLocale(code);
    router.push(`/${locale}?c=${code}`);
  }

  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Mail size={16} className="text-emerald-600" />
          {t("brand")}
          <span className="font-normal text-slate-500">{t("footer.tag", { year })}</span>
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
          <div className="flex items-center gap-4">
            <a href="/terms" className="transition hover:text-slate-600">Terms</a>
            <a href="/privacy" className="transition hover:text-slate-600">Privacy</a>
            <a href="https://kittylaunch.com/p/pdf2emails" target="_blank" rel="noopener">
              <img
                src="https://kittylaunch.com/api/public/badges/launch_badge.svg?theme=light&name=PDF2Emails"
                width="280"
                alt="PDF2Emails on KittyLaunch"
                data-kittylaunch-badge="1"
              />
            </a>
            <a
              href="https://backlinklog.com/listing/pdf2emails.com?utm_source=backlinklog&utm_medium=badge"
              target="_blank"
              rel="noopener"
            >
              <img
                src="https://backlinklog.com/badge/pdf2emails.com.svg"
                alt="Listed on BacklinkLog"
                width="160"
                height="40"
              />
            </a>
            <a href="https://launchzone.co/p/pdf2emails" target="_blank" rel="noopener">
              <img
                src="https://launchzone.co/badge.svg"
                alt="Find us on LaunchZone"
                width="154"
                height="54"
              />
            </a>
            <a
              href="https://launchbuff.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Featured on LaunchBuff"
            >
              <img
                src="https://launchbuff.com/badge-featured-dark.svg"
                alt="Featured on LaunchBuff"
                width="256"
                height="80"
              />
            </a>
            <a
              href="https://www.nxgntools.com/tools/pdf2emails?utm_source=pdf2emails"
              target="_blank"
              rel="noopener"
              style={{ display: "inline-block", width: "auto" }}
            >
              <img
                src="https://www.nxgntools.com/api/embed/pdf2emails?type=LAUNCHING_SOON_ON"
                alt="Launching soon on NxGn Tools"
                style={{ height: 48, width: "auto" }}
              />
            </a>
          </div>
          <a href="mailto:info@pdf2emails.com" className="transition hover:text-slate-600">info@pdf2emails.com</a>
        </div>
      </div>
    </footer>
  );
}