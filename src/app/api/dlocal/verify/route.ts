import { NextRequest, NextResponse } from "next/server";
import { getDlocalPaymentStatus } from "@/lib/dlocal";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { paymentId?: string } | null;

  if (!body?.paymentId) {
    return NextResponse.json({ error: "paymentId is required" }, { status: 400 });
  }
  if (!process.env.DLOCAL_API_KEY || !process.env.DLOCAL_SECRET_KEY) {
    return NextResponse.json({ error: "DLOCAL is not configured" }, { status: 501 });
  }

  try {
    const status = await getDlocalPaymentStatus(body.paymentId);
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "dLocal error" },
      { status: 502 },
    );
  }
}
