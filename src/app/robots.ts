import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdf2emails.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/thank-you", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
