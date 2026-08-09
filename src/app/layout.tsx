import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    title: "PDF2Emails — Extrae correos de cualquier PDF en segundos",
    description: "Sube un PDF y extrae todos los correos electronicos. Filtra genéricos y personales, exporta a CSV o TXT. Primeros 5 correos gratis, sin registro.",
    type: "website",
    url: SITE_URL,
    siteName: "PDF2Emails",
    images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630, alt: "PDF2Emails - Extrae correos de tus PDFs" }],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PDF2Emails",
              url: SITE_URL,
              description: "Extrae correos electronicos de PDFs en el navegador. Filtra genéricos y personales, exporta a CSV o TXT.",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Any",
              inLanguage: "es",
              offers: { "@type": "Offer", price: "3.99", priceCurrency: "USD" },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                { "@type": "Question", name: "Are my PDFs uploaded to a server?", acceptedAnswer: { "@type": "Answer", text: "No. All processing happens locally in your browser with pdf.js. The file never leaves your device." } },
                { "@type": "Question", name: "Can I try it for free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Small PDFs are extracted 100% free, no signup. You only pay if you want to clean and verify the list." } },
                { "@type": "Question", name: "What if the PDF is a scan?", acceptedAnswer: { "@type": "Answer", text: "Enable OCR to read scanned PDFs and extract the emails inside." } },
                { "@type": "Question", name: "How does payment by country work?", acceptedAnswer: { "@type": "Answer", text: "By geolocation: Latin America uses dLocal Go, the rest of the world uses Wompi, with preferential prices." } }
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
