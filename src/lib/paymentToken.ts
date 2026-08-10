import crypto from "node:crypto";
import type { CheckoutOption } from "./orders";

/**
 * Comprobante de pago firmado (HMAC), sin estado en servidor. Se emite SOLO
 * despues de confirmar un pago real contra la API de Wompi/dLocal (ver
 * /api/wompi/verify y /api/dlocal/verify) y es lo unico que /api/process
 * acepta para ejecutar procesamiento pagado (verificacion SMTP, OpenAI).
 * No hay base de datos en este proyecto, asi que la firma + expiracion corta
 * es la proteccion: no evita el replay dentro de su ventana de 2h, pero cierra
 * el hueco real (procesar gratis sin haber pagado nunca).
 */
export interface PaymentTokenPayload {
  ref: string;
  gateway: "wompi" | "dlocal" | "demo";
  option: CheckoutOption;
  amountUsd: number;
  iat: number;
}

const TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

function secret(): string {
  return (
    process.env.PAYMENT_TOKEN_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY ||
    process.env.DLOCAL_SECRET_KEY ||
    "pdf2emails-insecure-dev-secret-set-PAYMENT_TOKEN_SECRET"
  );
}

export function signPaymentToken(payload: PaymentTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPaymentToken(token: string | undefined | null): PaymentTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  try {
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as PaymentTokenPayload;
    if (typeof payload.iat !== "number" || Date.now() - payload.iat > TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
