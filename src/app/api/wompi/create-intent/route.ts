import { NextRequest, NextResponse } from "next/server";
import { createWompiIntent } from "@/lib/wompi";
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
  if (!process.env.WOMPI_PRIVATE_KEY || !process.env.WOMPI_INTEGRITY_KEY) {
    return NextResponse.json({ error: "WOMPI is not configured" }, { status: 501 });
  }

  // El monto NUNCA viene del cliente: se calcula aqui a partir del pais REAL
  // (geolocalizado por Vercel, no el que declare el body) y la opcion elegida.
  const country = resolveServerCountry(request, body.country);
  const order = resolveOrder(country, body.option, body.coupon);

  try {
    const intent = await createWompiIntent({
      amountInCents: Math.round(order.amountUsd * 100),
      currency: "USD",
      reference: body.reference,
    });
    return NextResponse.json(intent);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wompi error" },
      { status: 502 },
    );
  }
}
