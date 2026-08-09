import { NextRequest, NextResponse } from "next/server";
import { verifyMany } from "@/lib/verify";
import { companyFromEmail, nameFromEmail, enrichViaOpenAI } from "@/lib/enrich";

export const runtime = "nodejs";

const MAX_EMAILS = 2000;

interface Row {
  email: string;
  status: string;
  first_name: string;
  last_name: string;
  company: string;
  title: string;
}

function csvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/[",\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    emails?: string[];
    options?: { verify?: boolean; clean?: boolean; enrich?: boolean };
  } | null;

  const emails = Array.isArray(body?.emails)
    ? body.emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
    : [];
  if (emails.length === 0 || emails.length > MAX_EMAILS) {
    return NextResponse.json({ error: "invalid emails" }, { status: 400 });
  }

  const options = body?.options ?? {};
  const doVerify = options.verify !== false;
  const doClean = options.clean !== false;
  const doEnrich = options.enrich === true;

  const rows: Row[] = [];

  let statuses: Record<string, string> = {};
  if (doVerify) statuses = await verifyMany(emails);

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
    });
  }

  const header = "email,status,first_name,last_name,company,title";
  const csv =
    header +
    "\n" +
    rows.map((r) => [r.email, r.status, r.first_name, r.last_name, r.company, r.title].map(csvCell).join(",")).join("\n");

  const stats = {
    total: emails.length,
    valid: Object.values(statuses).filter((s) => s === "valid").length,
    invalid: Object.values(statuses).filter((s) => s === "invalid").length,
  };

  return NextResponse.json({ ok: true, csv, stats });
}
