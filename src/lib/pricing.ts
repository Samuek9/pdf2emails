import { isLatam } from "./countries";
import { CART_PRICES_USD, resolveOrder } from "./orders";
import type { Pricing } from "./types";

const LATAM_PRICE_COP = 32000;

/**
 * Paridad de precios por pais (UNICA fuente de verdad para lo que se COBRA:
 * ./orders.ts — este archivo solo deriva de ahi lo que hace falta mostrar en
 * la UI). page.tsx y CheckoutModal deben derivar SIEMPRE los montos de aqui
 * (o de orders.ts), nunca hardcodear un precio nuevo.
 */
export function getPricing(countryCode: string, couponCode?: string | null): Pricing {
  const latam = isLatam(countryCode);
  const full = resolveOrder(countryCode, "full", couponCode);
  const fullverify = resolveOrder(countryCode, "fullverify", couponCode);
  return {
    region: latam ? "latam" : "row",
    countryCode,
    displayPrice: `$${full.amountUsd} USD`,
    priceUsd: full.amountUsd,
    verifyPriceUsd: fullverify.amountUsd,
    verifyOnlyUsd: latam ? CART_PRICES_USD.latam.verify : CART_PRICES_USD.row.verify,
    priceCop: latam ? LATAM_PRICE_COP : 0,
    primaryGateway: latam ? "dlocal" : "wompi",
    secondaryGateway: latam ? "wompi" : "dlocal",
    couponApplied: full.couponApplied,
  };
}
