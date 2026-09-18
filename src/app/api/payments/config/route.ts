import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Indica que pasarelas estan configuradas (vivas) para que el cliente muestre
 * el modo demo solo cuando ninguna este lista. Solo se exponen booleanos: las
 * credenciales de PayPal son server-only.
 */
export async function GET() {
  return NextResponse.json({
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    dlocal: Boolean(process.env.DLOCAL_API_KEY && process.env.DLOCAL_SECRET_KEY),
  });
}
