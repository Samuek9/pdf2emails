import { isLatam } from "./countries";
import type { Pricing } from "./types";

const LATAM_PRICE_USD = 7.99;
const LATAM_VERIFY_USD = 12.99;
const LATAM_PRICE_COP = 32000;
const ROW_PRICE_USD = 19;
const ROW_VERIFY_USD = 29;

/**
 * Paridad de precios por pais (UNICA fuente de verdad; page.tsx y CheckoutModal
 * deben derivar SIEMPRE los montos de aqui, nunca hardcodear):
 * - LATAM: full $7.99 USD (~ $32,000 COP) / full+verify $12.99, pasarela dLocal Go.
 * - Resto del mundo: full $19 USD / full+verify $29, pasarela Wompi.
 */
export function getPricing(countryCode: string): Pricing {
  const latam = isLatam(countryCode);
  return {
    region: latam ? "latam" : "row",
    countryCode,
    displayPrice: latam ? "$7.99 USD" : "$19 USD",
    priceUsd: latam ? LATAM_PRICE_USD : ROW_PRICE_USD,
    verifyPriceUsd: latam ? LATAM_VERIFY_USD : ROW_VERIFY_USD,
    priceCop: latam ? LATAM_PRICE_COP : 0,
    primaryGateway: latam ? "dlocal" : "wompi",
    secondaryGateway: latam ? "wompi" : "dlocal",
  };
}
