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
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  if (!privateKey || !integrityKey) {
    throw new Error("WOMPI_PRIVATE_KEY or WOMPI_INTEGRITY_KEY is not configured");
  }

  // Convierte USD -> COP si la moneda de entrada es USD.
  const isUsd = input.currency.toUpperCase() === "USD";
  const rate = isUsd ? await getCopRate() : 1;
  const amountInCents = isUsd ? Math.round(input.amountInCents * rate) : input.amountInCents;
  const currency = isUsd ? "COP" : input.currency.toUpperCase();

  const res = await fetch(`${WOMPI_API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify({
      amount_in_cents: amountInCents,
      currency,
      reference: input.reference,
      payment_method: { type: "CARD" },
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/thank-you`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Wompi create transaction failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { data: { id: string; status: string } };
  const transactionId = json.data.id;

  const signature = crypto
    .createHmac("sha256", integrityKey)
    .update(`${input.reference}:${amountInCents}:${currency}:${transactionId}`)
    .digest("hex");

  return { transactionId, status: json.data.status, signature, amountInCents, currency };
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
