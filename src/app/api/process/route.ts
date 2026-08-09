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
  phone: string;
}

function csvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/[",\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    emails?: string[];
    text?: string;
    options?: { verify?: boolean; clean?: boolean; enrich?: boolean; phones?: boolean };
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
  const doPhones = options.phones === true;

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
  };

  return NextResponse.json({ ok: true, csv, stats });
}
