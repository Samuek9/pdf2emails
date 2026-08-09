import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Guías de PDF2Emails para extraer correos de PDFs",
  description:
    "Artículos y guías para extraer correos de PDFs, armar listas de prospectos y usar la herramienta PDF2Emails.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    href: "/blog/extraer-correos-de-un-pdf",
    lang: "ES",
    title: "Cómo extraer correos de un PDF gratis y rápido",
    desc: "Guía paso a paso para sacar todos los correos de un PDF y exportarlos a CSV o TXT.",
  },
  {
    href: "/blog/email-scraper-ventas",
    lang: "ES",
    title: "Qué es un email scraper y cómo usarlo para tus ventas",
    desc: "Extrae correos de documentos para prospección y cold email, de forma legal y sencilla.",
  },
  {
    href: "/blog/extract-emails-from-pdf",
    lang: "EN",
    title: "How to extract emails from a PDF for free and fast",
    desc: "Step-by-step guide to get all emails from a PDF and export them to CSV or TXT.",
  },
  {
    href: "/blog/email-scraper-for-sales",
    lang: "EN",
    title: "What is an email scraper and how to use it for sales",
    desc: "Extract emails from documents for prospecting and cold email, legally and easily.",
  },
];

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Blog</h1>
      <p className="mt-2 text-sm text-slate-500">
        Guías para extraer correos de PDFs y mejorar tu prospección.
      </p>
      <div className="mt-8 space-y-4">
        {posts.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="card block p-5 transition hover:border-emerald-300"
          >
            <div className="flex items-center gap-2">
              <span className="chip border-emerald-200 bg-emerald-50 text-emerald-700">{p.lang}</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
