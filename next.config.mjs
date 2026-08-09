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
};

export default nextConfig;
