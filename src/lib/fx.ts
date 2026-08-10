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

// Simbolos de moneda conocidos para mostrar junto al monto local.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  COP: "$",
  MXN: "$",
  ARS: "$",
  CLP: "$",
  BRL: "R$",
  PEN: "S/",
  UYU: "$U",
  PYG: "₲",
  BOB: "Bs",
  CRC: "₡",
  DOP: "RD$",
  GTQ: "Q",
  NIO: "C$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
  NZD: "NZ$",
  JPY: "¥",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  INR: "₹",
  ZAR: "R",
};

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
}

/**
 * Devuelve el estimado del monto (en USD) convertido a la moneda local del pais.
 * Usa la tasa en vivo (via /api/fx) y, si aun no cargo o falla, cae a la tasa
 * estatica de COUNTRY_LOCAL_PRICE.
 */
export function useLocalPrice(
  countryCode: string,
  amountUsd: number = PRICE_USD,
): { currency: string; amount: string; symbol: string } | null {
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

  const rate = rates?.[base.currency] ?? base.rate;
  return {
    currency: base.currency,
    amount: formatLocal(amountUsd * rate),
    symbol: currencySymbol(base.currency),
  };
}

