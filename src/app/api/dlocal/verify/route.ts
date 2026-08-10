import { NextRequest, NextResponse } from "next/server";
import { getDlocalPayment } from "@/lib/dlocal";
import { isCheckoutOption, resolveOrder, resolveServerCountry } from "@/lib/orders";
import { signPaymentToken } from "@/lib/paymentToken";

export const runtime = "nodejs";

const PAID_STATUSES = new Set(["paid", "success", "approved", "completed"]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    paymentId?: string;
    orderId?: string;
    option?: string;
    country?: string;
    coupon?: string;
  } | null;

  if (!body?.paymentId || !body?.orderId || !isCheckoutOption(body?.option) || !body?.country) {
    return NextResponse.json(
      { error: "paymentId, orderId, option and country are required" },
      { status: 400 },
    );
  }
  if (!process.env.DLOCAL_API_KEY || !process.env.DLOCAL_SECRET_KEY) {
    return NextResponse.json({ error: "DLOCAL is not configured" }, { status: 501 });
  }

  try {
    const payment = await getDlocalPayment(body.paymentId);

    if (!PAID_STATUSES.has(payment.status.toLowerCase())) {
      return NextResponse.json({ ok: false, status: payment.status }, { status: 402 });
    }
    if (payment.orderId !== body.orderId) {
      return NextResponse.json({ ok: false, error: "orderId mismatch" }, { status: 402 });
    }

    // El monto ya quedo fijado de forma autoritativa en /api/dlocal/create-payment
    // (el cliente nunca lo controla); aqui solo confirmamos que lo cobrado por
    // dLocal para esta orden no es menor a lo esperado para pais+opcion.
    const country = resolveServerCountry(request, body.country);
    const order = resolveOrder(country, body.option, body.coupon);
    if (payment.amount < order.amountUsd - 0.01) {
      return NextResponse.json({ ok: false, error: "amount too low" }, { status: 402 });
    }

    const token = signPaymentToken({
      ref: body.orderId,
      gateway: "dlocal",
      option: body.option,
      amountUsd: order.amountUsd,
      iat: Date.now(),
    });

    return NextResponse.json({ ok: true, token, status: payment.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "dLocal Go error" },
      { status: 502 },
    );
  }
}
