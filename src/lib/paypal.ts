/**
 * PayPal — cobro puntual (Orders API v2), server-only.
 *
 * Es el riel global de pago del proyecto (reemplaza a Wompi): una sola cuenta
 * Business para todo el sitio, sin credencial por pais. Se usa la Orders API
 * (intent CAPTURE) y no suscripciones porque PDF2Emails cobra UNA vez por
 * desbloqueo.
 *
 * Flujo (mismo patron que micantera/backend/apps/finance/paypal_service.py):
 *   1. POST /v2/checkout/orders       -> orden + link de aprobacion (approve)
 *   2. el cliente abre el link y aprueba
 *   3. POST /v2/checkout/orders/{id}/capture -> cobra de verdad (idempotente
 *      con PayPal-Request-Id)
 *   4. GET  /v2/checkout/orders/{id}  -> estado/amount/custom_id para confirmar
 *
 * Sandbox vs live se elige con PAYPAL_ENV ("live" para cobrar de verdad).
 * Las credenciales NUNCA se exponen al cliente: solo se usan aqui.
 */

const LIVE_BASE = "https://api-m.paypal.com";
const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";

export interface PaypalCapture {
  status?: string;
  amount?: { value?: string; currency_code?: string };
}

export interface PaypalPurchaseUnit {
  custom_id?: string;
  amount?: { value?: string; currency_code?: string };
  payments?: { captures?: PaypalCapture[] };
}

export interface PaypalOrder {
  id: string;
  status: string;
  links?: { href: string; rel: string; method?: string }[];
  purchase_units?: PaypalPurchaseUnit[];
}

export function paypalBaseUrl(): string {
  return process.env.PAYPAL_ENV === "live" ? LIVE_BASE : SANDBOX_BASE;
}

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Token OAuth client_credentials, cacheado en memoria de la instancia (dura ~9h). */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not configured");
  }

  const res = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PayPal oauth failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in?: number };
  const ttl = Math.max(60, (json.expires_in ?? 32400) - 600);
  cachedToken = { value: json.access_token, expiresAt: Date.now() + ttl * 1000 };
  return json.access_token;
}

async function paypalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${paypalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });
}

/**
 * Crea la orden y devuelve el link de aprobacion. El monto SIEMPRE lo fija el
 * servidor (nunca el cliente) y viaja atado a la orden, asi que no se puede
 * cambiar despues. `custom_id` lleva nuestra referencia para poder confirmar
 * al capturar que la orden es de ESTA compra. Se cobra siempre en USD (PayPal
 * es el riel global).
 */
export async function createPaypalOrder(input: {
  amountUsd: number;
  reference: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": input.reference.slice(0, 108) },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.reference.slice(0, 127),
          description: input.description.slice(0, 127),
          amount: { currency_code: "USD", value: input.amountUsd.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "PDF2Emails",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PayPal create order failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const order = (await res.json()) as PaypalOrder;
  const approveUrl = approvalUrl(order);
  if (!approveUrl) throw new Error("PayPal order has no approval link");
  return { id: order.id, approveUrl };
}

/** GET de la orden: es la fuente de verdad del estado/monto (nunca el navegador). */
export async function getPaypalOrder(orderId: string): Promise<PaypalOrder> {
  const res = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) throw new Error(`PayPal get order failed (${res.status})`);
  return (await res.json()) as PaypalOrder;
}

/**
 * Captura la orden (aqui es donde entra el dinero). Reintentar es seguro:
 * PayPal responde 422 ORDER_ALREADY_CAPTURED si ya se cobro, y en ese caso se
 * relee la orden en vez de tratarlo como error.
 */
export async function capturePaypalOrder(orderId: string): Promise<PaypalOrder> {
  const res = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { "PayPal-Request-Id": `capture-${orderId}`.slice(0, 108) },
  });

  if (res.ok) return (await res.json()) as PaypalOrder;

  const body = await res.text().catch(() => "");
  if (res.status === 422 && body.includes("ORDER_ALREADY_CAPTURED")) {
    return getPaypalOrder(orderId);
  }
  throw new Error(`PayPal capture failed (${res.status}): ${body.slice(0, 300)}`);
}

export function approvalUrl(order: PaypalOrder): string {
  const links = order.links ?? [];
  const link = links.find((l) => l.rel === "approve") ?? links.find((l) => l.rel === "payer-action");
  return link?.href ?? "";
}

/** Monto realmente capturado (0 si aun no hay captura completada). */
export function capturedAmountUsd(order: PaypalOrder): number {
  const captures = order.purchase_units?.[0]?.payments?.captures ?? [];
  const capture = captures.find((c) => c.status === "COMPLETED") ?? captures[0];
  const value = capture?.amount?.value;
  return value ? Number(value) : 0;
}

export function orderCustomId(order: PaypalOrder): string {
  return order.purchase_units?.[0]?.custom_id ?? "";
}

/**
 * POST /v1/notifications/verify-webhook-signature — PayPal firma cada entrega;
 * sin PAYPAL_WEBHOOK_ID configurado no se puede verificar, y un evento sin
 * verificar no debe disparar ninguna accion.
 */
export async function verifyPaypalWebhookSignature(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId || !paypalConfigured()) return false;

  try {
    const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo") ?? "",
        cert_url: headers.get("paypal-cert-url") ?? "",
        transmission_id: headers.get("paypal-transmission-id") ?? "",
        transmission_sig: headers.get("paypal-transmission-sig") ?? "",
        transmission_time: headers.get("paypal-transmission-time") ?? "",
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody) as unknown,
      }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { verification_status?: string };
    return json.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
