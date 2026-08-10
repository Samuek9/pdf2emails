import crypto from "node:crypto";

const WOMPI_API_BASE = process.env.WOMPI_API_URL ?? "https://production.wompi.co/v1";

export interface WompiIntent {
  transactionId: string;
  status: string;
  signature: string;
  amountInCents: number;
  currency: string;
}

/**
 * La cuenta de Wompi del negocio es SOLO en COP. Los precios se expresan en USD
 * (paridad), asi que al crear la transaccion convertimos el monto USD a COP con
 * la tasa en vivo (open.er-api.com) y cobramos en COP. La firma de integridad
 * se genera con la moneda y el monto FINALES (COP).
 */
async function getCopRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const json = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (json?.result === "success" && json.rates?.COP) return json.rates.COP;
  } catch {
    // ignora -> usa tasa fallback
  }
  return 4000; // fallback aproximado USD->COP
}

export async function createWompiIntent(input: {
  amountInCents: number; // en la moneda original (USD normalmente)
  currency: string;
  reference: string;
}): Promise<WompiIntent> {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  if (!integrityKey) {
    throw new Error("WOMPI_INTEGRITY_KEY is not configured");
  }

  // La cuenta de Wompi es SOLO en COP: convierte USD -> COP (tasa en vivo).
  const isUsd = input.currency.toUpperCase() === "USD";
  const rate = isUsd ? await getCopRate() : 1;
  const amountInCents = isUsd ? Math.round(input.amountInCents * rate) : input.amountInCents;
  const currency = isUsd ? "COP" : input.currency.toUpperCase();

  // El widget de Wompi crea la transaccion en el navegador (con el token de la
  // tarjeta). El backend SOLO genera la firma de integridad:
  // HMAC-SHA256(reference:amountInCents:currency) con la integrity key.
  const signature = crypto
    .createHmac("sha256", integrityKey)
    .update(`${input.reference}:${amountInCents}:${currency}`)
    .digest("hex");

  return { transactionId: input.reference, status: "PENDING", signature, amountInCents, currency };
}

/** Consulta el estado de una transaccion en WOMPI. */
export async function getWompiTransactionStatus(transactionId: string): Promise<string> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) throw new Error("WOMPI_PRIVATE_KEY is not configured");

  const res = await fetch(`${WOMPI_API_BASE}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${privateKey}` },
  });
  if (!res.ok) throw new Error(`Wompi get transaction failed (${res.status})`);

  const json = (await res.json()) as { data: { status: string } };
  return json.data.status;
}
