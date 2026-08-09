import { NextRequest, NextResponse } from "next/server";
import { createWompiIntent } from "@/lib/wompi";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    amountInCents?: number;
    currency?: string;
    reference?: string;
  } | null;

  if (!body?.amountInCents || !body?.reference) {
    return NextResponse.json(
      { error: "amountInCents and reference are required" },
      { status: 400 },
    );
  }
  if (!process.env.WOMPI_PRIVATE_KEY || !process.env.WOMPI_INTEGRITY_KEY) {
    return NextResponse.json({ error: "WOMPI is not configured" }, { status: 501 });
  }

  try {
    const intent = await createWompiIntent({
      amountInCents: body.amountInCents,
      currency: body.currency ?? "USD",
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
