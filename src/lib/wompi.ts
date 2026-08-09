import crypto from "node:crypto";

const WOMPI_API_BASE = process.env.WOMPI_API_URL ?? "https://production.wompi.co/v1";

export interface WompiIntent {
  transactionId: string;
  status: string;
  signature: string;
}

/**
 * Crea una transaccion en WOMPI y devuelve la firma de integridad
 * que exige el WidgetCheckout para procesar el pago.
 */
export async function createWompiIntent(input: {
  amountInCents: number;
  currency: string;
  reference: string;
}): Promise<WompiIntent> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  if (!privateKey || !integrityKey) {
    throw new Error("WOMPI_PRIVATE_KEY or WOMPI_INTEGRITY_KEY is not configured");
  }

  const res = await fetch(`${WOMPI_API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify({
      amount_in_cents: input.amountInCents,
      currency: input.currency,
      reference: input.reference,
      payment_method: { type: "CARD" },
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/`,
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
    .update(
      `${input.reference}:${input.amountInCents}:${input.currency}:${transactionId}`,
    )
    .digest("hex");

  return { transactionId, status: json.data.status, signature };
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
