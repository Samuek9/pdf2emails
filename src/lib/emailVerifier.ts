import { verifyEmail as verifyMx } from "./verify";

export type VerifyResult = "valid" | "invalid" | "catchall" | "unknown";

interface Provider {
  name: string;
  keyEnv: string;
  url: (email: string, key: string) => string;
  parse: (json: unknown) => VerifyResult;
}

// Proveedores de verificacion SMTP real (ping a servidores). Prioridad:
// QuickEmailVerification (100/dia) -> Reoon (20/dia) -> ZeroBounce -> AbstractAPI.
const PROVIDERS: Provider[] = [
  {
    name: "quickemailverification",
    keyEnv: "QEV_API_KEY",
    url: (e, k) => `https://api.quickemailverification.com/v1/verify?email=${encodeURIComponent(e)}&apikey=${k}`,
    parse: (j) => {
      const s = String((j as { result?: string })?.result ?? "").toLowerCase();
      if (s === "valid") return "valid";
      if (s === "invalid") return "invalid";
      if (s === "risky") return "catchall";
      return "unknown";
    },
  },
  {
    name: "reoon",
    keyEnv: "REOON_API_KEY",
    url: (e, k) =>
      `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(e)}&key=${k}&mode=quick`,
    parse: (j) => {
      const s = String((j as { data?: { status?: string } })?.data?.status ?? "").toLowerCase();
      if (s === "safe") return "valid";
      if (s === "invalid" || s === "disposable") return "invalid";
      return "unknown";
    },
  },
  {
    name: "zerobounce",
    keyEnv: "ZEROBOUNCE_API_KEY",
    url: (e, k) => `https://api.zerobounce.net/v2/validate?api_key=${k}&email=${encodeURIComponent(e)}`,
    parse: (j) => {
      const s = String((j as { status?: string })?.status ?? "").toLowerCase();
      if (s === "valid") return "valid";
      if (s === "catch-all") return "catchall";
      if (s === "invalid") return "invalid";
      return "unknown";
    },
  },
  {
    name: "abstract",
    keyEnv: "ABSTRACT_API_KEY",
    url: (e, k) =>
      `https://emailvalidation.abstractapi.com/v1/?api_key=${k}&email=${encodeURIComponent(e)}`,
    parse: (j) => {
      const s = String((j as { deliverability?: string })?.deliverability ?? "").toLowerCase();
      if (s === "deliverable") return "valid";
      if (s === "undeliverable") return "invalid";
      if (s === "risky") return "catchall";
      return "unknown";
    },
  },
];

export function isRealVerificationConfigured(): boolean {
  return PROVIDERS.some((p) => Boolean(process.env[p.keyEnv]));
}

function pickProvider(): { provider: Provider; key: string } | null {
  for (const p of PROVIDERS) {
    const key = process.env[p.keyEnv];
    if (key) return { provider: p, key };
  }
  return null;
}

export async function verifyEmailReal(email: string): Promise<VerifyResult> {
  const picked = pickProvider();
  if (!picked) {
    // Sin API configurada: fallback a verificacion MX.
    const mx = await verifyMx(email);
    return mx === "valid" ? "valid" : "invalid";
  }
  try {
    const res = await fetch(picked.provider.url(email, picked.key), {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = await res.json();
    const result = picked.provider.parse(json);
    if (result !== "unknown") return result;
    // "unknown" del proveedor: cae a MX como fallback.
    const mx = await verifyMx(email);
    return mx === "valid" ? "valid" : "invalid";
  } catch {
    const mx = await verifyMx(email);
    return mx === "valid" ? "valid" : "invalid";
  }
}

export async function verifyManyReal(emails: string[]): Promise<Record<string, VerifyResult>> {
  const out: Record<string, VerifyResult> = {};
  const CHUNK = 5;
  for (let i = 0; i < emails.length; i += CHUNK) {
    const batch = emails.slice(i, i + CHUNK);
    await Promise.all(batch.map(async (email) => (out[email] = await verifyEmailReal(email))));
  }
  return out;
}
