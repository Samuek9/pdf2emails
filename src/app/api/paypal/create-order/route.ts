import { NextRequest, NextResponse } from "next/server";
import { createPaypalOrder, paypalConfigured } from "@/lib/paypal";
import { isCheckoutOption, resolveOrder, resolveServerCountry } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    reference?: string;
    option?: string;
    country?: string;
    coupon?: string;
  } | null;

  if (!body?.reference || !isCheckoutOption(body?.option) || !body?.country) {
    return NextResponse.json(
      { error: "reference, option and country are required" },
      { status: 400 },
    );
  }
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "PAYPAL is not configured" }, { status: 501 });
  }

  // El monto NUNCA viene del cliente: se calcula aqui a partir del pais REAL
  // (geolocalizado por Vercel, no el que declare el body) y la opcion elegida.
  const country = resolveServerCountry(request, body.country);
  const order = resolveOrder(country, body.option, body.coupon);

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin).replace(/\/$/, "");

  try {
    const created = await createPaypalOrder({
      amountUsd: order.amountUsd,
      reference: body.reference,
      description: "PDF2Emails - full email list unlock",
      returnUrl: `${site}/thank-you?paid=1`,
      cancelUrl: `${site}/`,
    });
    return NextResponse.json({
      id: created.id,
      approveUrl: created.approveUrl,
      reference: body.reference,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PayPal error" },
      { status: 502 },
    );
  }
}
