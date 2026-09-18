import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Script from "next/script";
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

const DESCRIPTIONS: Record<string, string> = {
  es: "Extrae todos los correos de un PDF en tu navegador. Limpia, filtra y exporta a CSV. 100% privado, sin subir archivos. Gratis para PDFs pequeños.",
  en: "Extract every email from a PDF in your browser. Clean, filter and export to CSV. 100% private, no uploads. Free for small PDFs.",
  pt: "Extraia todos os emails de um PDF no seu navegador. Limpe, filtre e exporte para CSV. 100% privado, sem uploads. Grátis para PDFs pequenos.",
  fr: "Extrayez tous les emails d'un PDF dans votre navigateur. Nettoyez, filtrez et exportez en CSV. 100% privé, sans envoi. Gratuit pour les petits PDFs.",
  de: "Extrahiere alle E-Mails aus einem PDF in deinem Browser. Bereinige, filtere und exportiere als CSV. 100% privat, keine Uploads. Kostenlos für kleine PDFs.",
};

/**
 * El header x-locale (seteado por middleware.ts a partir del segmento REAL
 * de la URL de este request) manda sobre la cookie: la cookie es cross-sesion
 * y puede quedar desfasada del idioma que realmente se esta sirviendo ahora.
 */
async function resolveLocale(): Promise<string> {
  const h = await headers();
  const fromHeader = h.get("x-locale");
  if (fromHeader) return fromHeader;
  const c = await cookies();
  return c.get("user_locale")?.value || "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveLocale();
  const title = TITLES[lang] ?? TITLES.en;
  const desc = DESCRIPTIONS[lang] ?? DESCRIPTIONS.en;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | PDF2Emails" },
    description: desc,
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
      description: desc,
      type: "website",
      url: `${SITE_URL}/${lang}`,
      siteName: "PDF2Emails",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
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
  const lang = await resolveLocale();
  return (
    <html lang={lang}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18380745476"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18380745476');
          `}
        </Script>
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
                { "@type": "Question", name: "Can I try it for free?", acceptedAnswer: { "@type": "Answer", text: "Yes. PDFs up to 5 pages and 50 emails are extracted 100% free, no signup, no usage limit. You only pay to unlock larger lists or verify the list." } },
                { "@type": "Question", name: "What if the PDF is a scan?", acceptedAnswer: { "@type": "Answer", text: "Enable OCR to read scanned PDFs and extract the emails inside." } },
                { "@type": "Question", name: "How does payment by country work?", acceptedAnswer: { "@type": "Answer", text: "By geolocation: Latin America uses dLocal Go, the rest of the world uses PayPal, with preferential prices." } }
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}