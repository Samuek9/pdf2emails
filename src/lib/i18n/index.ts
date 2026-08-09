import { es } from "./es";
import { en } from "./en";
import { pt } from "./pt";
import type { Locale, Messages } from "./types";

export type { Locale, Messages } from "./types";

const SPANISH_COUNTRIES = new Set([
  "CO", "MX", "AR", "CL", "PE", "EC", "UY", "PY", "BO", "VE", "CR", "DO",
  "PA", "GT", "SV", "HN", "NI", "CU", "PR", "ES",
]);

const PORTUGUESE_COUNTRIES = new Set(["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "MO", "TL"]);

export function detectLocale(country: string): Locale {
  const code = country.toUpperCase();
  if (SPANISH_COUNTRIES.has(code)) return "es";
  if (PORTUGUESE_COUNTRIES.has(code)) return "pt";
  return "en";
}

export function getLocale(): Locale {
  if (typeof window === "undefined") return "es";
  const cookie = document.cookie.split("; ").find((r) => r.startsWith("user_country="));
  const country = cookie ? cookie.split("=")[1] : (process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "US");
  return detectLocale(country);
}

const dicts: Record<Locale, Messages> = { es, en, pt };

/** Devuelve el diccionario del idioma detectado (cacheado por sesion). */
export function getMessages(): Messages {
  return dicts[getLocale()];
}

/** Traduce una clave y reemplaza {var}. */
export function t(key: string, vars?: Record<string, string | number>): string {
  let str = dicts[getLocale()][key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.split(`{${k}}`).join(String(vars[k]));
    }
  }
  return str;
}

/** Idioma para tesseract.js: 'eng', 'spa' o 'eng+spa'. */
export function ocrLang(): string {
  return getLocale() === "es" ? "spa+eng" : "eng+spa";
}
