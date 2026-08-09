"use client";

import { useEffect, useState } from "react";
import { COUNTRY_LOCAL_PRICE } from "./countries";

const PRICE_USD = 7.99;

let cachedRates: Record<string, number> | null = null;

function formatLocal(v: number): string {
  if (v >= 1000) return Math.round(v).toLocaleString("en-US");
  if (v >= 100) return Math.round(v).toString();
  return (Math.round(v * 100) / 100).toString();
}

/**
 * Devuelve el estimado del precio ($7.99 USD) en la moneda local del pais.
 * Usa la tasa de cambio en vivo (via /api/fx) y, si aun no cargo o falla,
 * cae al valor estatico de COUNTRY_LOCAL_PRICE.
 */
export function useLocalPrice(countryCode: string): { currency: string; amount: string } | null {
  const [rates, setRates] = useState<Record<string, number> | null>(cachedRates);

  useEffect(() => {
    if (cachedRates) return;
    fetch("/api/fx")
      .then((r) => r.json())
      .then((d: { rates?: Record<string, number> }) => {
        if (d?.rates) {
          cachedRates = d.rates;
          setRates(d.rates);
        }
      })
      .catch(() => {});
  }, []);

  const base = COUNTRY_LOCAL_PRICE[countryCode.toUpperCase()];
  if (!base) return null;

  const rate = rates?.[base.currency];
  if (typeof rate === "number") {
    return { currency: base.currency, amount: formatLocal(PRICE_USD * rate) };
  }
  return { currency: base.currency, amount: base.amount };
}
