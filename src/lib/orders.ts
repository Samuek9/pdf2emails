import type { NextRequest } from "next/server";
import { isLatam } from "./countries";

/**
 * Catalogo de operaciones cobrables. UNICA fuente de verdad del monto y de lo
 * que cada una desbloquea en /api/process — el cliente nunca decide el monto,
 * solo elige cual de estas opciones quiere comprar.
 */
export type CheckoutOption = "full" | "fullverify" | "cartVerify" | "cartPro";

const CHECKOUT_OPTIONS: CheckoutOption[] = ["full", "fullverify", "cartVerify", "cartPro"];

export function isCheckoutOption(value: unknown): value is CheckoutOption {
  return typeof value === "string" && (CHECKOUT_OPTIONS as string[]).includes(value);
}

/** Precios individuales del carrito de upsells (modelo aerolinea). */
export const CART_PRICES_USD = {
  latam: { verify: 2.49, enrich: 4.99, clean: 1.49, phones: 1.99, templates: 4.99, bundle: 11.99 },
  row: { verify: 4.99, enrich: 9.99, clean: 2.99, phones: 3.99, templates: 4.99, bundle: 19.99 },
};

const PRICES_USD: Record<"latam" | "row", Record<CheckoutOption, number>> = {
  latam: {
    full: 7.99,
    fullverify: 12.99,
    cartVerify: CART_PRICES_USD.latam.verify + CART_PRICES_USD.latam.clean,
    cartPro: CART_PRICES_USD.latam.bundle,
  },
  row: {
    full: 19,
    fullverify: 29,
    cartVerify: CART_PRICES_USD.row.verify + CART_PRICES_USD.row.clean,
    cartPro: CART_PRICES_USD.row.bundle,
  },
};

/**
 * Cupones de lanzamiento (KittyLaunch / BacklinkLog). Solo aplican a "full" y
 * "fullverify" — los upsells de carrito (cartVerify/cartPro) quedan fuera a
 * proposito para no complicar el modelo aerolinea de precios individuales.
 */
interface Coupon {
  discountPercent: number;
  expiresAt: string;
}

const COUPONS: Record<string, Coupon> = {
  LAUNCH50: { discountPercent: 50, expiresAt: "2026-09-10T23:59:59Z" },
};

/** Valida un codigo de cupon contra el registro y su expiracion (server-side, nunca confia en el cliente mas alla del codigo). */
function getValidCoupon(code: string | null | undefined, option: CheckoutOption): Coupon | null {
  if (!code || (option !== "full" && option !== "fullverify")) return null;
  const coupon = COUPONS[code.trim().toUpperCase()];
  if (!coupon) return null;
  if (new Date(coupon.expiresAt).getTime() < Date.now()) return null;
  return coupon;
}

export interface ResolvedOrder {
  region: "latam" | "row";
  option: CheckoutOption;
  amountUsd: number;
  couponApplied: string | null;
}

/** Calcula el monto autoritativo en el servidor a partir del pais, la opcion elegida y un cupon opcional. */
export function resolveOrder(countryCode: string, option: CheckoutOption, couponCode?: string | null): ResolvedOrder {
  const region = isLatam(countryCode) ? "latam" : "row";
  const base = PRICES_USD[region][option];
  const coupon = getValidCoupon(couponCode, option);
  const amountUsd = Math.round(base * (coupon ? 1 - coupon.discountPercent / 100 : 1) * 100) / 100;
  return { region, option, amountUsd, couponApplied: coupon ? couponCode!.trim().toUpperCase() : null };
}

/**
 * Pais para COBRAR (no para mostrar idioma/moneda): Vercel geolocaliza cada
 * request real por IP en `x-vercel-ip-country` y esto no lo puede tocar el
 * cliente. El `country` que manda el body (cookie del selector del footer,
 * pensado para dejar elegir idioma/moneda de VISUALIZACION) NUNCA decide cuanto
 * se cobra — solo se usa como fallback en local/dev, donde Vercel no inyecta
 * el header. Sin esto, cualquiera podia declarar un pais LATAM para pagar el
 * precio LATAM sin estar ahi.
 */
export function resolveServerCountry(request: NextRequest, fallback: string): string {
  const ipCountry = request.headers.get("x-vercel-ip-country");
  return (ipCountry || fallback || "US").toUpperCase();
}

export interface ProcessGrant {
  verify: boolean;
  clean: boolean;
  enrich: boolean;
  phones: boolean;
}

/** Que procesamiento pagado desbloquea cada opcion (usado por /api/process). */
export function processGrantFor(option: CheckoutOption): ProcessGrant | null {
  switch (option) {
    case "fullverify":
      return { verify: true, clean: true, enrich: false, phones: false };
    case "cartVerify":
      return { verify: true, clean: true, enrich: false, phones: false };
    case "cartPro":
      return { verify: true, clean: true, enrich: true, phones: true };
    case "full":
      // "full" solo desbloquea ver la lista completa, no procesamiento pagado.
      return null;
    default:
      return null;
  }
}
