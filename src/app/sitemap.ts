import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdf2emails.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE_URL;
  const langs = ["en", "es", "pt", "fr", "de"];
  const homePages = langs.map((l) => ({
    url: `${base}/${l}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 1,
  }));
  return [
    ...homePages,
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/blog/extraer-correos-de-un-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/email-scraper-ventas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/extract-emails-from-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/email-scraper-for-sales`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/extract-contacts-from-pdf-to-csv`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/use-cases/extract-emails-from-scanned-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/use-cases/pdf-to-csv-email-extractor`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/use-cases/extract-emails-from-bank-statement-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/use-cases/extract-emails-from-linkedin-export-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/use-cases/extract-emails-from-scanned-pdf-ocr`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/pdf2emails-vs-manual-copy-paste`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/top-free-pdf-email-extractors`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/extraer-correos-pdf-online-gratis`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/extraer-emails-pdf-sin-software`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-scrape-emails-from-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/es/use-cases/extraer-correos-de-pdf-escaneado`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/es/blog/extraer-correos-de-un-pdf-facturas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}