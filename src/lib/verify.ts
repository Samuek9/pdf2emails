import dns from "node:dns";
import { promisify } from "node:util";

const resolveMx = promisify(dns.resolveMx);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Dominios de correo desechable (tempmail). Se marcan como invalidos aunque
// tengan MX, porque no sirven para contactar. Esto mejora la verificacion
// incluso cuando no hay ninguna API de verifiacion configurada (fallback MX).
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "throwawaymail.com",
  "maildrop.cc",
  "getnada.com",
  "sharklasers.com",
  "burnermail.io",
  "trashmail.com",
  "dispostable.com",
  "mailnesia.com",
  "mailcatch.com",
  "emailondeck.com",
  "mytemp.email",
  "fakeinbox.com",
  "mailtemp.net",
  "spam4.me",
]);

export type VerifyStatus = "valid" | "invalid";

/** Verificacion real: sintaxis + existencia de registro MX (el dominio acepta correo). */
export async function verifyEmail(email: string): Promise<VerifyStatus> {
  if (!EMAIL_REGEX.test(email)) return "invalid";
  const domain = (email.split("@")[1] ?? "").toLowerCase();
  if (!domain || !domain.includes(".")) return "invalid";
  if (DISPOSABLE_DOMAINS.has(domain)) return "invalid";
  try {
    const mx = await resolveMx(domain);
    return mx && mx.length > 0 ? "valid" : "invalid";
  } catch {
    return "invalid";
  }
}

export async function verifyMany(emails: string[]): Promise<Record<string, VerifyStatus>> {
  const out: Record<string, VerifyStatus> = {};
  await Promise.all(
    emails.map(async (email) => {
      out[email] = await verifyEmail(email);
    }),
  );
  return out;
}
