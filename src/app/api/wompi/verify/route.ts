import { NextRequest, NextResponse } from "next/server";
import { getWompiTransaction } from "@/lib/wompi";
import { isCheckoutOption, resolveOrder } from "@/lib/orders";
import { signPaymentToken } from "@/lib/paymentToken";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    transactionId?: string;
    reference?: string;
    option?: string;
    country?: string;
  } | null;

  if (!body?.transactionId || !body?.reference || !isCheckoutOption(body?.option) || !body?.country) {
    return NextResponse.json(
      { error: "transactionId, reference, option and country are required" },
      { status: 400 },
    );
  }
  if (!process.env.WOMPI_PRIVATE_KEY) {
    return NextResponse.json({ error: "WOMPI is not configured" }, { status: 501 });
  }

  try {
    const tx = await getWompiTransaction(body.transactionId);

    // El monto no se re-valida aqui: ya quedo fijado de forma autoritativa en
    // /api/wompi/create-intent y esta criptograficamente atado a esa
    // referencia por la firma de integridad de Wompi (SHA256 de
    // referencia+monto+moneda+secreto). Si alguien intentara pagar un monto
    // distinto al calculado por el servidor, la firma no coincidiria y Wompi
    // rechazaria el pago antes de llegar aqui. Lo que SI hay que confirmar es
    // que la transaccion es de esta referencia y quedo realmente aprobada.
    if (tx.status !== "APPROVED") {
      return NextResponse.json({ ok: false, status: tx.status }, { status: 402 });
    }
    if (tx.reference !== body.reference) {
      return NextResponse.json({ ok: false, error: "reference mismatch" }, { status: 402 });
    }

    const order = resolveOrder(body.country, body.option);
    const token = signPaymentToken({
      ref: body.reference,
      gateway: "wompi",
      option: body.option,
      amountUsd: order.amountUsd,
      iat: Date.now(),
    });

    return NextResponse.json({ ok: true, token, status: tx.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wompi error" },
      { status: 502 },
    );
  }
}
