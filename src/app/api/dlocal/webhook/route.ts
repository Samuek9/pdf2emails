import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Almacen en memoria (por instancia serverless) de los ultimos webhooks recibidos.
// No es persistente entre cold starts, pero sirve para VERIFICAR que dLocal esta
// enviando eventos y capturar el payment_id real para consultas/reembolsos.
const received: Array<{ at: string; status: string; paymentId: string; orderId: string }> = [];
const MAX = 50;

function extractFields(body: Record<string, unknown>): { status: string; paymentId: string; orderId: string } {
  const status = String(body?.status ?? body?.payment_status ?? "unknown");
  // En dLocal Go el webhook trae el payment id en "id" (o "payment_id").
  const paymentId = String(body?.id ?? body?.payment_id ?? body?.transaction_id ?? "");
  const orderId = String(body?.order_id ?? body?.orderId ?? "");
  return { status, paymentId, orderId };
}

export async function GET() {
  return NextResponse.json({ received });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { status, paymentId, orderId } = extractFields(body);

  // Registro el evento en los logs de Vercel (persistente y consultable) para
  // verificar que dLocal envía webhooks y capturar el payment_id real.
  console.log(
    JSON.stringify({
      event: "dlocal_webhook",
      status,
      paymentId,
      orderId,
      body,
    }),
  );

  received.unshift({ at: new Date().toISOString(), status, paymentId, orderId });
  if (received.length > MAX) received.pop();

  return NextResponse.json({ received: true });
}
