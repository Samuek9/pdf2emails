import { NextRequest, NextResponse } from "next/server";
import { createDlocalPayment } from "@/lib/dlocal";
import { isCheckoutOption, resolveOrder } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    option?: string;
    country?: string;
  } | null;

  if (!body?.orderId || !isCheckoutOption(body?.option) || !body?.country) {
    return NextResponse.json(
      { error: "orderId, option and country are required" },
      { status: 400 },
    );
  }
  if (!process.env.DLOCAL_API_KEY || !process.env.DLOCAL_SECRET_KEY) {
    return NextResponse.json({ error: "DLOCAL is not configured" }, { status: 501 });
  }

  // El monto NUNCA viene del cliente: se calcula aqui a partir del pais y la
  // opcion elegida (unica fuente de verdad: apps/lib/orders.ts -> pricing).
  const order = resolveOrder(body.country, body.option);

  try {
    const intent = await createDlocalPayment({
      amount: order.amountUsd,
      currency: "USD",
      country: body.country,
      description: "PDF2Emails - desbloqueo de lista completa",
      orderId: body.orderId,
    });
    // El cliente debe guardar `id` (paymentId real de dLocal) antes de salir
    // del sitio: es lo unico que permite confirmar el pago al volver, ya que
    // dLocal solo redirige con "?paid=1" y no manda el id en la URL de vuelta.
    return NextResponse.json(intent);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "dLocal Go error" },
      { status: 502 },
    );
  }
}
