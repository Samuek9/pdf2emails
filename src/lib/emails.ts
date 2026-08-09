import type {
  EmailCategory,
  ExtractOptions,
  ExtractResult,
  ExtractedEmail,
} from "./types";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const GENERIC_LOCAL_PARTS = new Set([
  "info",
  "support",
  "admin",
  "administracion",
  "contact",
  "contacto",
  "sales",
  "ventas",
  "billing",
  "accounts",
  "contabilidad",
  "noreply",
  "no-reply",
  "no_reply",
  "help",
  "office",
  "servicio",
  "atencion",
  "atencionalcliente",
  "hello",
  "hola",
  "marketing",
  "compras",
  "facturacion",
  "pagos",
  "hr",
  "rrhh",
  "webmaster",
  "mail",
  "correo",
  "soporte",
  "postmaster",
  "newsletter",
  "team",
  "sistema",
  "system",
  "operaciones",
  "gerencia",
  "recepcion",
  "reservas",
]);

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "hotmail.co",
  "yahoo.com",
  "yahoo.es",
  "yahoo.com.mx",
  "outlook.com",
  "live.com",
  "aol.com",
  "icloud.com",
  "msn.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "zoho.com",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "me.com",
  "mac.com",
  "fastmail.com",
  "tutanota.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "globo.com",
  "ymail.com",
  "rocketmail.com",
  "rediffmail.com",
  "mail.ru",
]);

export function classifyEmail(email: string): EmailCategory {
  const at = email.lastIndexOf("@");
  if (at === -1) return "unknown";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const localClean = local.replace(/[._-]+$/, "").toLowerCase();
  const firstSegment = localClean.split(/[._-]/)[0] ?? localClean;

  if (GENERIC_LOCAL_PARTS.has(localClean) || GENERIC_LOCAL_PARTS.has(firstSegment)) {
    return "generic";
  }
  if (PERSONAL_DOMAINS.has(domain.toLowerCase())) {
    return "personal";
  }
  return "corporate";
}

export function parseAllEmails(text: string): { all: ExtractedEmail[]; totalRaw: number } {
  const seen = new Set<string>();
  const all: ExtractedEmail[] = [];
  const matches = text.match(EMAIL_REGEX) ?? [];

  for (const raw of matches) {
    const cleaned = raw.toLowerCase().replace(/^[.]+|[.]+$/g, "");
    if (!cleaned.includes("@")) continue;
    if (seen.has(cleaned)) continue;
    seen.add(cleaned);
    all.push({ email: cleaned, category: classifyEmail(cleaned) });
  }

  return { all, totalRaw: matches.length };
}

export function applyFilters(
  all: ExtractedEmail[],
  totalRaw: number,
  options: ExtractOptions,
): ExtractResult {
  let excludedGeneric = 0;
  let excludedPersonal = 0;
  const emails: ExtractedEmail[] = [];

  for (const entry of all) {
    if (options.excludeGeneric && entry.category === "generic") {
      excludedGeneric++;
      continue;
    }
    if (options.excludePersonal && entry.category === "personal") {
      excludedPersonal++;
      continue;
    }
    emails.push(entry);
  }

  const corporateCount = emails.filter((e) => e.category === "corporate").length;
  const genericCount = emails.filter((e) => e.category === "generic").length;
  const personalCount = emails.filter((e) => e.category === "personal").length;

  return {
    emails,
    totalRaw,
    excludedGeneric,
    excludedPersonal,
    totalEmails: emails.length,
    corporateCount,
    genericCount,
    personalCount,
  };
}
