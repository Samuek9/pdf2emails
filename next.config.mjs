import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Evita que Next detecte el lockfile del workspace padre como raiz.
  outputFileTracingRoot: path.join(process.cwd()),
  webpack: (config) => {
    // pdfjs-dist es una libreria de navegador; no necesita el modulo canvas de Node.
    config.resolve.alias.canvas = false;
    return config;
  },
  // Headers de seguridad y caché (mejoran Lighthouse Practices/Performance).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://unpkg.com https://us-assets.i.posthog.com https://*.i.posthog.com https://checkout.wompi.co https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://us.i.posthog.com https://*.posthog.com https://production.wompi.co https://checkout.wompi.co https://api.wompi.co https://www.googletagmanager.com https://www.google-analytics.com https://google-analytics.com",
              "worker-src 'self' blob: https://unpkg.com",
              "frame-src 'self' https:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
