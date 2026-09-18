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
    // Riel por pais. LATAM cobra con dLocal Go (dinero local: PSE, Nequi, Pix,
    // OXXO, tarjetas locales) porque PayPal obliga a iniciar sesion o crear
    // cuenta antes de pagar -- su pago como invitado ("PayPal account optional")
    // no esta habilitado para esta cuenta, y pedir login mata la compra por
    // impulso. PayPal queda como riel del resto del mundo, donde quien paga ya
    // tiene cuenta PayPal. En el checkout el comprador puede cambiar de riel
    // cuando ambos estan configurados (ver CheckoutModal).
    primaryGateway: latam ? "dlocal" : "paypal",
    secondaryGateway: latam ? "paypal" : "dlocal",
    couponApplied: full.couponApplied,
  };
}
