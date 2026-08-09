import { NextRequest, NextResponse } from "next/server";
import { createDlocalPayment } from "@/lib/dlocal";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    amount?: number;
    currency?: string;
    country?: string;
    description?: string;
    orderId?: string;
  } | null;

  if (!body?.amount || !body?.currency || !body?.country || !body?.orderId) {
    return NextResponse.json(
      { error: "amount, currency, country and orderId are required" },
      { status: 400 },
    );
  }
  if (!process.env.DLOCAL_API_KEY || !process.env.DLOCAL_SECRET_KEY) {
    return NextResponse.json({ error: "DLOCAL is not configured" }, { status: 501 });
  }

  try {
    const intent = await createDlocalPayment({
      amount: body.amount,
      currency: body.currency,
      country: body.country,
      description: body.description ?? "PDF2Emails - desbloqueo de lista completa",
      orderId: body.orderId,
    });
    return NextResponse.json(intent);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "dLocal Go error" },
      { status: 502 },
    );
  }
}
