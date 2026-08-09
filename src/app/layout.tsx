import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdf2emails.com";

const TITLES: Record<string, string> = {
  es: "PDF2Emails — Extrae correos de cualquier PDF en segundos",
  en: "PDF2Emails — Extract emails from any PDF in seconds",
  pt: "PDF2Emails — Extraia emails de qualquer PDF em segundos",
  fr: "PDF2Emails — Extrayez les emails de vos PDFs en secondes",
  de: "PDF2Emails — Extrahiere E-Mails aus PDFs in Sekunden",
};

export async function generateMetadata(): Promise<Metadata> {
  const c = await cookies();
  const lang = c.get("user_locale")?.value || "en";
  const title = TITLES[lang] ?? TITLES.en;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | PDF2Emails" },
    description:
      "Extract every email from a PDF in your browser. Clean, filter and export to CSV. 100% private, no uploads. Free for small PDFs.",
    keywords: [
      "extract emails from pdf",
      "pdf email extractor",
      "scrape emails from pdf",
      "extraer correos de pdf",
      "extractor de correos",
    ],
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title,
      description: "100% private: extract emails from PDFs in your browser. Free for small PDFs.",
      type: "website",
      url: `${SITE_URL}/${lang}`,
      siteName: "PDF2Emails",
      images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Extract emails from PDFs, 100% private, in your browser.",
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        en: `${SITE_URL}/en`,
        es: `${SITE_URL}/es`,
        pt: `${SITE_URL}/pt`,
        fr: `${SITE_URL}/fr`,
        de: `${SITE_URL}/de`,
      },
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const c = await cookies();
  const lang = c.get("user_locale")?.value || "en";
  return (
    <html lang={lang}>
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
              description: "Extract emails from PDFs in your browser. 100% private, no uploads.",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Any",
              inLanguage: lang,
              offers: { "@type": "Offer", price: "19", priceCurrency: "USD" },
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