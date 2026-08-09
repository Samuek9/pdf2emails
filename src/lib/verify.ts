import dns from "node:dns";
import { promisify } from "node:util";

const resolveMx = promisify(dns.resolveMx);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type VerifyStatus = "valid" | "invalid";

/** Verificacion real: sintaxis + existencia de registro MX (el dominio acepta correo). */
export async function verifyEmail(email: string): Promise<VerifyStatus> {
  if (!EMAIL_REGEX.test(email)) return "invalid";
  const domain = email.split("@")[1] ?? "";
  if (!domain || !domain.includes(".")) return "invalid";
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
