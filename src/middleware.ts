import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["es", "en", "pt", "fr", "de"];

const SPANISH = new Set([
  "CO", "MX", "AR", "CL", "PE", "EC", "UY", "PY", "BO", "VE", "CR", "DO",
  "PA", "GT", "SV", "HN", "NI", "CU", "PR", "ES",
]);
const PORTUGUESE = new Set(["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "MO", "TL"]);
const FRENCH = new Set([
  "FR", "BE", "CH", "LU", "MC", "SN", "CI", "ML", "BF", "NE", "TG", "BJ", "CM",
  "GA", "GN", "CF", "CG", "CD", "HT", "MG", "RW", "BI", "DJ", "KM", "SC",
]);
const GERMAN = new Set(["DE", "AT", "CH", "LI", "LU"]);

function detectLocale(country: string): string {
  const code = country.toUpperCase();
  if (SPANISH.has(code)) return "es";
  if (PORTUGUESE.has(code)) return "pt";
  if (FRENCH.has(code)) return "fr";
  if (GERMAN.has(code)) return "de";
  return "en";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const seg = pathname.split("/")[1]?.toLowerCase();

  // 1) Resolver el pais: PRIMERO la cookie manual del usuario (selector del
  //    footer / demo), SOLO si no existe usamos la IP. Asi el cambio de pais
  //    persiste entre recargas y no lo pisa la geolocalizacion.
  const cookieCountry = request.cookies.get("user_country")?.value?.toUpperCase();
  const ipCountry =
    request.headers.get("x-vercel-ip-country")?.toUpperCase() ||
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() ||
    "US";
  const country = cookieCountry || ipCountry;

  // 2) Resolver el idioma: si la URL ya trae /es|/en|/pt|/fr|/de, se respeta;
  //    si no (raiz u otras rutas), se detecta por el pais (cookie manual o IP).
  let locale = "en";
  if (seg && LOCALES.includes(seg)) {
    locale = seg;
  } else {
    locale = detectLocale(country);
  }

  // 3) Redirige la raiz al idioma detectado (SEO: subrutas /es /en /pt /fr /de).
  //    La cookie manual del pais gana sobre la IP para decidir el idioma.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
  }

  const response = NextResponse.next();
  response.cookies.set("user_locale", locale, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
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

