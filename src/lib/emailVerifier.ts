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

  // Agrupa por dominio: el catch-all es una propiedad del dominio, no de la casilla.
  // Verificar un solo email por dominio detecta el catch-all y aplica el resultado
  // a todos sus emails -> ahorro enorme de llamadas a la API paga.
  const byDomain = new Map<string, string[]>();
  for (const e of emails) {
    const d = (e.split("@")[1] || "").toLowerCase();
    const list = byDomain.get(d);
    if (list) list.push(e);
    else byDomain.set(d, [e]);
  }

  const CHUNK = 5;

  for (const [, group] of byDomain) {
    const representative = group[0];

    // 1) Pre-filtro MX GRATIS: si el dominio no acepta correo (sin MX),
    //    todos los emails de ese dominio son invalidos SIN gastar la API.
    const mx = await verifyMx(representative);
    if (mx !== "valid") {
      for (const e of group) out[e] = "invalid";
      continue;
    }

    // 2) Verifica un email representativo del dominio.
    const first = await verifyEmailReal(representative);
    out[representative] = first;

    // 3) Si el dominio es catch-all, TODOS sus emails son catch-all -> sin mas llamadas.
    if (first === "catchall") {
      for (const e of group) if (!(e in out)) out[e] = "catchall";
      continue;
    }

    // 4) Dominio normal: se verifica cada casilla individualmente (necesario).
    const rest = group.slice(1);
    for (let i = 0; i < rest.length; i += CHUNK) {
      const batch = rest.slice(i, i + CHUNK);
      await Promise.all(batch.map(async (email) => (out[email] = await verifyEmailReal(email))));
    }
  }

  return out;
}
