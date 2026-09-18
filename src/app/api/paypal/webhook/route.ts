import { NextRequest, NextResponse } from "next/server";
import { capturePaypalOrder, verifyPaypalWebhookSignature } from "@/lib/paypal";

export const runtime = "nodejs";

/**
 * Webhook de PayPal (eventos CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED,
 * PAYMENT.CAPTURE.DENIED...). La confirmacion que desbloquea la descarga es la
 * de /api/paypal/capture al volver el navegador; esto es la red de seguridad:
 *
 * - CHECKOUT.ORDER.APPROVED significa que el pagador aprobo pero la captura
 *   todavia no se hizo (el navegador no volvio, se cerro la pestaña). Se captura
 *   aqui para que el dinero entre igual. La captura es idempotente, asi que si
 *   /api/paypal/capture ya lo hizo, PayPal responde ORDER_ALREADY_CAPTURED y se
 *   relee la orden sin error.
 * - El resto solo se registra en los logs de Vercel (observabilidad).
 *
 * La firma se verifica con /v1/notifications/verify-webhook-signature; sin
 * PAYPAL_WEBHOOK_ID configurado nada se considera verificado (solo se loguea).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const verified = await verifyPaypalWebhookSignature(request.headers, rawBody);

  let payload: { event_type?: string; resource?: { id?: string; status?: string } } | null = null;
  try {
    payload = JSON.parse(rawBody) as { event_type?: string; resource?: { id?: string; status?: string } };
  } catch {
    payload = null;
  }

  const orderId = payload?.resource?.id ?? null;
  let captured = false;
  if (verified && payload?.event_type === "CHECKOUT.ORDER.APPROVED" && orderId) {
    try {
      const order = await capturePaypalOrder(orderId);
      captured = order.status === "COMPLETED";
    } catch {
      captured = false;
    }
  }

  console.log(
    JSON.stringify({
      event: "paypal_webhook",
      verified,
      eventType: payload?.event_type ?? null,
      orderId,
      captured,
    }),
  );

  return NextResponse.json({ received: true });
}
