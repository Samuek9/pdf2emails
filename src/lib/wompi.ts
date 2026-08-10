import crypto from "node:crypto";

const WOMPI_API_BASE = process.env.WOMPI_API_URL ?? "https://production.wompi.co/v1";

export interface WompiIntent {
  reference: string;
  signature: string;
  amountInCents: number;
  currency: string;
}

export interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
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
  // tarjeta). El backend SOLO genera la firma de integridad. Formato exacto de
  // Wompi: SHA256("<referencia><monto_en_centavos><moneda><secreto_integridad>")
  // concatenado SIN separadores, con el secreto de integridad al final de la
  // cadena (NO es HMAC). El orden de los campos importa.
  const signature = crypto
    .createHash("sha256")
    .update(`${input.reference}${amountInCents}${currency}${integrityKey}`)
    .digest("hex");

  return { reference: input.reference, signature, amountInCents, currency };
}

/**
 * Consulta el estado REAL de una transaccion en Wompi, por su ID (el que
 * devuelve el widget en result.transaction.id — NO es nuestra `reference`,
 * es un ID distinto que asigna Wompi al procesar el cobro).
 */
export async function getWompiTransaction(transactionId: string): Promise<WompiTransaction> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) throw new Error("WOMPI_PRIVATE_KEY is not configured");

  const res = await fetch(`${WOMPI_API_BASE}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${privateKey}` },
  });
  if (!res.ok) throw new Error(`Wompi get transaction failed (${res.status})`);

  const json = (await res.json()) as {
    data: { id: string; status: string; reference: string; amount_in_cents: number; currency: string };
  };
  return {
    id: json.data.id,
    status: json.data.status,
    reference: json.data.reference,
    amountInCents: json.data.amount_in_cents,
    currency: json.data.currency,
  };
}
