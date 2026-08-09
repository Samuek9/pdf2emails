import { NextRequest, NextResponse } from "next/server";
import { getWompiTransactionStatus } from "@/lib/wompi";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { transactionId?: string } | null;

  if (!body?.transactionId) {
    return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
  }
  if (!process.env.WOMPI_PRIVATE_KEY) {
    return NextResponse.json({ error: "WOMPI is not configured" }, { status: 501 });
  }

  try {
    const status = await getWompiTransactionStatus(body.transactionId);
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wompi error" },
      { status: 502 },
    );
  }
}
