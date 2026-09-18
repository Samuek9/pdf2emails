import { NextRequest, NextResponse } from "next/server";
import { verifyManyReal } from "@/lib/emailVerifier";
import { companyFromEmail, nameFromEmail, enrichViaOpenAI } from "@/lib/enrich";
import { processGrantFor } from "@/lib/orders";
import { verifyPaymentToken } from "@/lib/paymentToken";

export const runtime = "nodejs";

const MAX_EMAILS = 2000;

// Rate limiter simple en memoria (por instancia). Protege el presupuesto de OpenAI
// contra spam de peticiones. No es perfecto (resets por instancia serverless),
// pero es una salvaguarda razonable.
const recent: Record<string, { count: number; at: number }> = {};
const WINDOW_MS = 60 * 60 * 1000; // 1 hora
const MAX_PER_HOUR = 20;

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = recent[ip];
  if (!entry || now - entry.at > WINDOW_MS) {
    recent[ip] = { count: 1, at: now };
    return false;
  }
  entry.count++;
  return entry.count > MAX_PER_HOUR;
}

interface Row {
  email: string;
  status: string;
  first_name: string;
  last_name: string;
  company: string;
  title: string;
  phone: string;
}

// Neutraliza inyeccion de formulas CSV (OWASP CSV Injection): telefono/company
// pueden empezar con "=", "+", "-" o "@" (comun en datos extraidos de PDF).
function csvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    emails?: string[];
    text?: string;
    options?: { verify?: boolean; clean?: boolean; enrich?: boolean; phones?: boolean };
    paymentToken?: string;
  } | null;

  const emails = Array.isArray(body?.emails)
    ? body.emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
    : [];
  if (emails.length === 0 || emails.length > MAX_EMAILS) {
    return NextResponse.json({ error: "invalid emails" }, { status: 400 });
  }

  // Este endpoint solo hace trabajo GRATIS para el negocio (nameFromEmail /
  // companyFromEmail, regex de telefonos). Verificacion SMTP real y
  // enriquecimiento con OpenAI cuestan dinero real por llamada, asi que
  // exigen un comprobante de pago firmado por /api/paypal/capture o
  // /api/dlocal/verify — nunca se confia en lo que el cliente pida sin pagar.
  const proof = verifyPaymentToken(body?.paymentToken);
  const grant = proof ? processGrantFor(proof.option) : null;

  const options = body?.options ?? {};
  const wantsVerify = options.verify !== false;
  const wantsEnrich = options.enrich === true;
  const wantsPhones = options.phones === true;

  if ((wantsVerify && !grant?.verify) || (wantsEnrich && !grant?.enrich) || (wantsPhones && !grant?.phones)) {
    return NextResponse.json(
      { error: "Payment required for this processing option." },
      { status: 402 },
    );
  }

  const doVerify = wantsVerify;
  const doClean = options.clean !== false;
  const doEnrich = wantsEnrich;
  const doPhones = wantsPhones;

  const rows: Row[] = [];

  let statuses: Record<string, string> = {};
  if (doVerify) statuses = await verifyManyReal(emails);

  let enriched: Record<string, { title: string; company: string }> = {};
  if (doEnrich) {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        enriched = await enrichViaOpenAI(emails, key);
      } catch {
        enriched = {};
      }
    }
  }

  let phoneMap: Record<string, string> = {};
  if (doPhones && body?.text) {
    const lines = body.text.split(/\r?\n/);
    const emailSet = new Set(emails);
    for (const line of lines) {
      const lineEmails = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [];
      const phones = line.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g) ?? [];
      if (lineEmails.length && phones.length) {
        for (const em of lineEmails) {
          const emKey = em.toLowerCase();
          if (emailSet.has(emKey) && !phoneMap[emKey] && phones[0]) phoneMap[emKey] = phones[0].trim();
        }
      }
    }
  }

  for (const email of emails) {
    const name = doClean ? nameFromEmail(email) : { first: "", last: "" };
    const comp = doEnrich && enriched[email] ? enriched[email].company : companyFromEmail(email);
    const title = doEnrich && enriched[email] ? enriched[email].title : "";
    rows.push({
      email,
      status: doVerify ? (statuses[email] ?? "unknown") : "",
      first_name: name.first,
      last_name: name.last,
      company: comp,
      title,
      phone: doPhones ? (phoneMap[email] ?? "") : "",
    });
  }

  const header = "email,status,first_name,last_name,company,title,phone";
  const csv =
    header +
    "\n" +
    rows
      .map((r) =>
        [r.email, r.status, r.first_name, r.last_name, r.company, r.title, r.phone]
          .map(csvCell)
          .join(","),
      )
      .join("\n");

  const stats = {
    total: emails.length,
    valid: Object.values(statuses).filter((s) => s === "valid").length,
    invalid: Object.values(statuses).filter((s) => s === "invalid").length,
    catchall: Object.values(statuses).filter((s) => s === "catchall").length,
    unknown: Object.values(statuses).filter((s) => s === "unknown").length,
  };

  return NextResponse.json({ ok: true, csv, stats });
}
