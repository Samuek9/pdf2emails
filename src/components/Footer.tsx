"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { LATAM_COUNTRIES, ROW_COUNTRIES } from "@/lib/countries";

const ALL_COUNTRIES = [...LATAM_COUNTRIES, ...ROW_COUNTRIES];

export function Footer() {
  const [country, setCountry] = useState(() => {
    if (typeof window === "undefined") return "US";
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("user_country="));
    return cookie ? cookie.split("=")[1] : "US";
  });

  function handleCountryChange(code: string) {
    setCountry(code);
    document.cookie = `user_country=${code};path=/;max-age=2592000;samesite=lax`;
    window.location.reload();
  }

  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Mail size={16} className="text-emerald-600" />
          PDF2Emails
          <span className="font-normal text-slate-400">· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <label htmlFor="country-demo" className="font-medium">País (demo precios):</label>
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
    </footer>
  );
}
