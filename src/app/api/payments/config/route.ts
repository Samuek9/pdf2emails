import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Indica que pasarelas estan configuradas (vivas) para que el cliente muestre
 * el modo demo solo cuando ninguna este lista.
 */
export async function GET() {
  return NextResponse.json({
    wompi: Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY),
    dlocal: Boolean(process.env.DLOCAL_API_KEY && process.env.DLOCAL_SECRET_KEY),
  });
}
