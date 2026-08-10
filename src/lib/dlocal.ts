/**
 * dLocal Go — creacion de payment links (PSE, Pix, OXXO, tarjetas locales).
 * Documentacion: https://docs.dlocalgo.com
 *
 * Keys: se obtienen en https://dashboard.dlocalgo.com (o sandbox en dashboard-sbx.dlocalgo.com)
 * en Integrations -> API Integration -> "API Key" y "Secret Key".
 * Nunca exponer la Secret Key al cliente: solo se usa server-side.
 */

const DLOCAL_API_BASE =
  process.env.DLOCAL_ENV === "live"
    ? "https://api.dlocalgo.com"
    : "https://api-sbx.dlocalgo.com";

export interface DlocalPaymentIntent {
  id: string;
  status: string;
  redirectUrl: string;
  orderId: string;
}

function dlocalHeaders(): Record<string, string> {
  const apiKey = process.env.DLOCAL_API_KEY;
  const secretKey = process.env.DLOCAL_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("DLOCAL_API_KEY or DLOCAL_SECRET_KEY is not configured");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}:${secretKey}`,
  };
}

export async function createDlocalPayment(input: {
  amount: number;
  currency: string;
  country: string;
  description: string;
  orderId: string;
}): Promise<DlocalPaymentIntent> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const res = await fetch(`${DLOCAL_API_BASE}/v1/payments`, {
    method: "POST",
    headers: dlocalHeaders(),
    body: JSON.stringify({
      country: input.country,
      currency: input.currency,
      amount: input.amount,
      order_id: input.orderId,
      description: input.description,
      success_url: `${site}/thank-you?paid=1`,
      back_url: `${site}/`,
      notification_url: `${site}/api/dlocal/webhook`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`dLocal Go create payment failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    id: string;
    status: string;
    redirect_url: string;
    order_id: string;
  };

  return {
    id: json.id,
    status: json.status,
    redirectUrl: json.redirect_url,
    orderId: json.order_id,
  };
}

export interface DlocalPaymentStatus {
  id: string;
  status: string;
  orderId: string;
  amount: number;
  currency: string;
}

/** Consulta el estado REAL de un pago en dLocal Go, por su `id` propio de dLocal. */
export async function getDlocalPayment(paymentId: string): Promise<DlocalPaymentStatus> {
  const res = await fetch(`${DLOCAL_API_BASE}/v1/payments/${paymentId}`, {
    method: "GET",
    headers: dlocalHeaders(),
  });
  if (!res.ok) {
    throw new Error(`dLocal Go get payment failed (${res.status})`);
  }
  const json = (await res.json()) as {
    id: string;
    status: string;
    order_id: string;
    amount: number;
    currency: string;
  };
  return {
    id: json.id,
    status: json.status,
    orderId: json.order_id,
    amount: json.amount,
    currency: json.currency,
  };
}
