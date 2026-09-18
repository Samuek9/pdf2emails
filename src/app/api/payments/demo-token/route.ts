import { NextRequest, NextResponse } from "next/server";
import { isCheckoutOption, resolveOrder } from "@/lib/orders";
import { signPaymentToken } from "@/lib/paymentToken";

export const runtime = "nodejs";

/**
 * Emite un token de "pago" SOLO cuando ninguna pasarela real esta configurada
 * (mismo criterio que /api/payments/config -> demoMode en el frontend). En
 * cuanto se configuren las llaves de PayPal o dLocal en produccion, esta ruta
 * se auto-desactiva: nunca puede usarse para saltarse un pago real.
 */
export async function POST(request: NextRequest) {
  const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  const dlocalConfigured = Boolean(process.env.DLOCAL_API_KEY && process.env.DLOCAL_SECRET_KEY);
  if (paypalConfigured || dlocalConfigured) {
    return NextResponse.json({ error: "Demo mode disabled: a real gateway is configured" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { option?: string; country?: string; coupon?: string } | null;
  if (!isCheckoutOption(body?.option) || !body?.country) {
    return NextResponse.json({ error: "option and country are required" }, { status: 400 });
  }

  const order = resolveOrder(body.country, body.option, body.coupon);
  const token = signPaymentToken({
    ref: `demo-${Date.now()}`,
    gateway: "demo",
    option: body.option,
    amountUsd: order.amountUsd,
    iat: Date.now(),
  });
  return NextResponse.json({ ok: true, token });
}
