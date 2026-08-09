import { isLatam } from "./countries";
import type { Pricing } from "./types";

const LATAM_PRICE_USD = 3.99;
const LATAM_PRICE_COP = 16000;
const ROW_PRICE_USD = 9.99;

/**
 * Paridad de precios por pais:
 * - LATAM: $7.99 USD (~ $32,000 COP), pasarela principal dLocal Go (PSE/Pix/OXXO).
 * - Resto del mundo: $19 USD, pasarela principal Wompi (tarjeta internacional).
 */
export function getPricing(countryCode: string): Pricing {
  const latam = isLatam(countryCode);
  return {
    region: latam ? "latam" : "row",
    countryCode,
    displayPrice: latam ? "$7.99 USD" : "$19 USD",
    priceUsd: latam ? LATAM_PRICE_USD : ROW_PRICE_USD,
    priceCop: latam ? LATAM_PRICE_COP : 0,
    primaryGateway: latam ? "dlocal" : "wompi",
    secondaryGateway: latam ? "wompi" : "dlocal",
  };
}
