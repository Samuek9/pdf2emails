import { es } from "./es";
import { en } from "./en";
import { pt } from "./pt";
import { fr } from "./fr";
import { de } from "./de";
import type { Locale, Messages } from "./types";

export type { Locale, Messages } from "./types";

const SPANISH_COUNTRIES = new Set([
  "CO", "MX", "AR", "CL", "PE", "EC", "UY", "PY", "BO", "VE", "CR", "DO",
  "PA", "GT", "SV", "HN", "NI", "CU", "PR", "ES",
]);

const PORTUGUESE_COUNTRIES = new Set(["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "MO", "TL"]);

const FRENCH_COUNTRIES = new Set([
  "FR", "BE", "CH", "LU", "MC", "SN", "CI", "ML", "BF", "NE", "TG", "BJ", "CM",
  "GA", "GN", "CF", "CG", "CD", "HT", "MG", "RW", "BI", "DJ", "KM", "SC",
]);

const GERMAN_COUNTRIES = new Set(["DE", "AT", "CH", "LI", "LU"]);

export function detectLocale(country: string): Locale {
  const code = country.toUpperCase();
  if (SPANISH_COUNTRIES.has(code)) return "es";
  if (PORTUGUESE_COUNTRIES.has(code)) return "pt";
  if (FRENCH_COUNTRIES.has(code)) return "fr";
  if (GERMAN_COUNTRIES.has(code)) return "de";
  return "en";
}

const VALID_LOCALES: Locale[] = ["es", "en", "pt", "fr", "de"];

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const seg = window.location.pathname.split("/")[1]?.toLowerCase();
  if (seg && (VALID_LOCALES as string[]).includes(seg)) return seg as Locale;
  const cookie = document.cookie.split("; ").find((r) => r.startsWith("user_country="));
  const country = cookie ? cookie.split("=")[1] : (process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "US");
  return detectLocale(country);
}

const dicts: Record<Locale, Messages> = { es, en, pt, fr, de };

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
