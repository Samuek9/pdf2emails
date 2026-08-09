import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Geolocalizacion + paridad de precios (PPP).
 * Lee el pais del visitante desde la cabecera de Vercel (x-vercel-ip-country)
 * y lo expone al cliente via la cookie `user_country`.
 */
export function middleware(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country")?.toUpperCase() ||
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() ||
    "US";

  const response = NextResponse.next();
  response.cookies.set("user_country", country, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
