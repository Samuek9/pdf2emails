import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * dLocal Go firma cada notificacion en el header Authorization:
 *   "V2-HMAC-SHA256, Signature: <hex>"
 * donde <hex> = HMAC-SHA256(secretKey, apiKey + rawBody).
 * https://docs.dlocalgo.com/integration-api/welcome-to-dlocal-go-api/payments/notifications
 */
function isSignatureValid(rawBody: string, authHeader: string | null): boolean {
  const apiKey = process.env.DLOCAL_API_KEY;
  const secretKey = process.env.DLOCAL_SECRET_KEY;
  if (!apiKey || !secretKey || !authHeader) return false;

  const match = authHeader.match(/Signature:\s*([a-f0-9]+)/i);
  if (!match) return false;
  const received = match[1];

  const expected = crypto.createHmac("sha256", secretKey).update(apiKey + rawBody).digest("hex");
  try {
    const a = Buffer.from(received, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const verified = isSignatureValid(rawBody, request.headers.get("authorization"));

  let payload: Record<string, unknown> | null = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }

  // El payload de dLocal Go solo trae { payment_id }: el estado real se
  // confirma con GET /v1/payments/{id} (ver /api/dlocal/verify), que es lo
  // que de verdad emite el comprobante de pago. Este webhook solo queda como
  // registro/observabilidad en los logs de Vercel.
  console.log(
    JSON.stringify({
      event: "dlocal_webhook",
      verified,
      paymentId: payload?.payment_id ?? payload?.id ?? null,
      payload,
    }),
  );

  return NextResponse.json({ received: true });
}
