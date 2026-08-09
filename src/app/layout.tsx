import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdf2emails.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PDF2Emails — Extrae correos de cualquier PDF en segundos",
    template: "%s | PDF2Emails",
  },
  description:
    "Sube un PDF y extrae todos los correos electrónicos que contiene. Filtra genéricos y personales, exporta a CSV o TXT. Primeros 5 correos gratis, sin registro y sin subir archivos a servidores.",
  keywords: [
    "extraer correos de pdf",
    "pdf email extractor",
    "scrape emails from pdf",
    "extraer emails de pdf",
    "extractor de correos",
  ],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PDF2Emails — Extrae correos de cualquier PDF",
    description: "Primeros 5 correos gratis. Desbloquea la lista completa y descarga CSV/TXT.",
    type: "website",
    url: SITE_URL,
    siteName: "PDF2Emails",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF2Emails — Extrae correos de cualquier PDF",
    description: "Primeros 5 correos gratis. Desbloquea la lista completa y descarga CSV/TXT.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-8">{children}</main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
