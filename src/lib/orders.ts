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

export interface ResolvedOrder {
  region: "latam" | "row";
  option: CheckoutOption;
  amountUsd: number;
}

/** Calcula el monto autoritativo en el servidor a partir del pais y la opcion elegida. */
export function resolveOrder(countryCode: string, option: CheckoutOption): ResolvedOrder {
  const region = isLatam(countryCode) ? "latam" : "row";
  const amountUsd = Math.round(PRICES_USD[region][option] * 100) / 100;
  return { region, option, amountUsd };
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
