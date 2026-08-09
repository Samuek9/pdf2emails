import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Fake door: captura el lead (intencion de compra) sin backend de verificacion.
// El lead queda en los logs de Vercel y en el evento de analytics (verify_intent).
// Si configuras LEAD_WEBHOOK_URL (Formspree/Zapier/Make), se reenvia.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    emailsCount?: number;
  } | null;

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  console.log("[lead]", JSON.stringify({ email, emailsCount: body?.emailsCount ?? 0, at: new Date().toISOString() }));

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, emailsCount: body?.emailsCount ?? 0 }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
