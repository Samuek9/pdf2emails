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

  // Notificacion por email (Resend). Solo envia si esta configurado:
  // RESEND_API_KEY + LEAD_TO_EMAIL. Por defecto va a info@pdf2emails.com.
  const resendKey = process.env.RESEND_API_KEY;
  const leadTo = process.env.LEAD_TO_EMAIL || "info@pdf2emails.com";
  if (resendKey) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.LEAD_FROM_EMAIL || "info@pdf2emails.com",
        to: [leadTo],
        subject: "Nuevo lead en PDF2Emails",
        html: `<p>Nuevo lead capturado en PDF2Emails.</p><p><strong>Email:</strong> ${email}</p><p><strong>Emails extraidos:</strong> ${body?.emailsCount ?? 0}</p>`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
