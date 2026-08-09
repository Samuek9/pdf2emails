import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Cache en memoria (TTL 6h) para no golpear la API gratuita en cada request.
let cache: { at: number; rates: Record<string, number> } | null = null;
const TTL = 6 * 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json({ rates: cache.rates });
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const json = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (json?.result === "success" && json.rates) {
      cache = { at: Date.now(), rates: json.rates };
      return NextResponse.json({ rates: json.rates });
    }
    if (cache) return NextResponse.json({ rates: cache.rates });
    return NextResponse.json({ rates: null });
  } catch {
    if (cache) return NextResponse.json({ rates: cache.rates });
    return NextResponse.json({ rates: null });
  }
}
