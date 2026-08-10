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

// Estimados aproximados del precio en la moneda local de cada pais.
// Tipos de cambio aproximados USD -> moneda local (se actualizan en vivo via /api/fx).
export const COUNTRY_LOCAL_PRICE: Record<string, { currency: string; rate: number }> = {
  // LATAM
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
  // Resto del mundo
  US: { currency: "USD", rate: 1 },
  CA: { currency: "CAD", rate: 1.36 },
  GB: { currency: "GBP", rate: 0.79 },
  DE: { currency: "EUR", rate: 0.92 },
  FR: { currency: "EUR", rate: 0.92 },
  ES: { currency: "EUR", rate: 0.92 },
  IT: { currency: "EUR", rate: 0.92 },
  PT: { currency: "EUR", rate: 0.92 },
  NL: { currency: "EUR", rate: 0.92 },
  BE: { currency: "EUR", rate: 0.92 },
  AT: { currency: "EUR", rate: 0.92 },
  IE: { currency: "EUR", rate: 0.92 },
  AU: { currency: "AUD", rate: 1.52 },
  NZ: { currency: "NZD", rate: 1.65 },
  JP: { currency: "JPY", rate: 150 },
  CH: { currency: "CHF", rate: 0.88 },
  SE: { currency: "SEK", rate: 10.4 },
  NO: { currency: "NOK", rate: 10.6 },
  DK: { currency: "DKK", rate: 6.9 },
  PL: { currency: "PLN", rate: 4.0 },
  IN: { currency: "INR", rate: 83.5 },
  ZA: { currency: "ZAR", rate: 18.6 },
};

export function getLocalPrice(
  countryCode: string,
): { currency: string; rate: number } | null {
  return COUNTRY_LOCAL_PRICE[countryCode.toUpperCase()] ?? null;
}

// Metodos de pago locales por pais LATAM (nombres propios, sin traduccion).
// Refleja los metodos locales que procesa dLocal Go en cada mercado.
export const LOCAL_PAYMENT_METHODS: Record<string, string[]> = {
  CO: ["Nequi", "PSE", "Efecty"],
  BR: ["Pix", "Boleto"],
  MX: ["OXXO", "SPEI", "Tarjetas locales"],
  AR: ["Rapipago", "Pago Fácil", "Tarjetas locales"],
  CL: ["Tarjetas locales", "Khipu"],
  PE: ["PagoEfectivo", "Tarjetas locales"],
  EC: ["Tarjetas locales"],
  UY: ["Tarjetas locales"],
  PY: ["Tarjetas locales"],
  BO: ["Tarjetas locales"],
  CR: ["SINPE", "Tarjetas locales"],
  DO: ["Tarjetas locales"],
  PA: ["Tarjetas locales"],
  GT: ["Tarjetas locales"],
  NI: ["Tarjetas locales"],
};

export function getLocalPaymentMethods(countryCode: string): string[] {
  return LOCAL_PAYMENT_METHODS[countryCode.toUpperCase()] ?? [];
}
