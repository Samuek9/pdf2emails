import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdf2emails.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE_URL;
  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/blog/extraer-correos-de-un-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/email-scraper-ventas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/extract-emails-from-pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/email-scraper-for-sales`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}

