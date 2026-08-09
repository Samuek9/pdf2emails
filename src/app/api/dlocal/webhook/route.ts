import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Webhook de dLocal Go: notificaciones de cambio de estado de un pago
 * (PENDING -> PAID / REJECTED / CANCELLED / EXPIRED).
 *
 * En el MVP el desbloqueo es local (localStorage), asi que aqui solo confirmamos
 * la recepcion. El siguiente paso es persistir el estado del pago en una base de
 * datos para habilitar el desbloqueo verificado por servidor.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return NextResponse.json({ received: true });
}
