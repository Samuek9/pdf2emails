import { NextRequest, NextResponse } from "next/server";
import {
  capturedAmountUsd,
  capturePaypalOrder,
  getPaypalOrder,
  orderCustomId,
  paypalConfigured,
  type PaypalOrder,
} from "@/lib/paypal";
import { isCheckoutOption, resolveOrder, resolveServerCountry } from "@/lib/orders";
import { signPaymentToken } from "@/lib/paymentToken";

export const runtime = "nodejs";

/**
 * Confirma el pago real contra la API de PayPal y, si la orden esta aprobada,
 * la CAPTURA (aqui es donde entra el dinero). El `?paid=1` de la URL de vuelta
 * nunca es suficiente: la unica prueba que se acepta es el estado de la orden
 * leido con nuestras credenciales, con el custom_id de esta compra y un monto
 * capturado >= al que el servidor calculo para pais+opcion.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    reference?: string;
    option?: string;
    country?: string;
    coupon?: string;
  } | null;

  if (!body?.orderId || !body?.reference || !isCheckoutOption(body?.option) || !body?.country) {
    return NextResponse.json(
      { error: "orderId, reference, option and country are required" },
      { status: 400 },
    );
  }
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "PAYPAL is not configured" }, { status: 501 });
  }

  try {
    // Leer la orden primero: por construccion solo se pueden leer ordenes de
    // NUESTRA cuenta de PayPal, asi que un orderId inventado no pasa de aqui.
    let order: PaypalOrder = await getPaypalOrder(body.orderId);
    if (order.status !== "COMPLETED") order = await capturePaypalOrder(body.orderId);

    if (order.status !== "COMPLETED") {
      return NextResponse.json({ ok: false, status: order.status }, { status: 402 });
    }
    if (orderCustomId(order) !== body.reference) {
      return NextResponse.json({ ok: false, error: "reference mismatch" }, { status: 402 });
    }

    const country = resolveServerCountry(request, body.country);
    const expected = resolveOrder(country, body.option, body.coupon);
    if (capturedAmountUsd(order) < expected.amountUsd - 0.01) {
      return NextResponse.json({ ok: false, error: "amount too low" }, { status: 402 });
    }

    const token = signPaymentToken({
      ref: body.reference,
      gateway: "paypal",
      option: body.option,
      amountUsd: expected.amountUsd,
      iat: Date.now(),
    });

    return NextResponse.json({ ok: true, token, status: order.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PayPal error" },
      { status: 502 },
    );
  }
}
