export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const LATAM_COUNTRY_CODES = new Set([
  "CO",
  "MX",
  "AR",
  "CL",
  "PE",
  "EC",
  "UY",
  "PY",
  "BO",
  "BR",
  "CR",
  "DO",
  "PA",
  "GT",
  "NI",
]);

export const LATAM_COUNTRIES: Country[] = [
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
];

export const ROW_COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
];

export function isLatam(code: string): boolean {
  return LATAM_COUNTRY_CODES.has(code.toUpperCase());
}

export function getCountryName(code: string): string {
  const all = [...LATAM_COUNTRIES, ...ROW_COUNTRIES];
  return all.find((c) => c.code === code.toUpperCase())?.name ?? code.toUpperCase();
}

export function getClientCountry(): string {
  if (typeof window === "undefined") return "US";
  const cookie = document.cookie
    .split("; ")
    .find((r) => r.startsWith("user_country="));
  return cookie ? cookie.split("=")[1] : (process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "US");
}

// Estimados aproximados del precio de $7.99 USD en la moneda local de cada pais LATAM.
// Tipos de cambio aproximados USD -> moneda local (se actualizan en vivo via /api/fx).
export const COUNTRY_LOCAL_PRICE: Record<string, { currency: string; rate: number }> = {
  CO: { currency: "COP", rate: 4000 },
  MX: { currency: "MXN", rate: 19.3 },
  AR: { currency: "ARS", rate: 1200 },
  CL: { currency: "CLP", rate: 950 },
  PE: { currency: "PEN", rate: 3.7 },
  EC: { currency: "USD", rate: 1 },
  UY: { currency: "UYU", rate: 40 },
  PY: { currency: "PYG", rate: 7300 },
  BO: { currency: "BOB", rate: 6.9 },
  BR: { currency: "BRL", rate: 5.5 },
  CR: { currency: "CRC", rate: 520 },
  DO: { currency: "DOP", rate: 60 },
  PA: { currency: "USD", rate: 1 },
  GT: { currency: "GTQ", rate: 7.8 },
  NI: { currency: "NIO", rate: 36 },
};

export function getLocalPrice(
  countryCode: string,
): { currency: string; rate: number } | null {
  return COUNTRY_LOCAL_PRICE[countryCode.toUpperCase()] ?? null;
}
