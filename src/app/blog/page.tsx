import type { Metadata } from "next";
import Link from "next/link";
import { BlogExtractor } from "@/components/BlogExtractor";

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
  {
    href: "/blog/extraer-emails-pdf-sin-software",
    lang: "ES",
    title: "Cómo extraer emails de un PDF sin instalar software",
    desc: "Extrae correos de un PDF gratis y sin instalar nada, todo en tu navegador.",
  },
  {
    href: "/blog/extraer-correos-pdf-online-gratis",
    lang: "ES",
    title: "Extraer correos de un PDF online gratis",
    desc: "Saca todos los correos de un PDF online, sin subir archivos y sin registro.",
  },
  {
    href: "/blog/how-to-scrape-emails-from-pdf",
    lang: "EN",
    title: "How to scrape emails from a PDF (easy guide)",
    desc: "Quick, free guide to scrape emails from a PDF without uploading files.",
  },
  {
    href: "/blog/extract-contacts-from-pdf-to-csv",
    lang: "EN",
    title: "How to extract contacts from a PDF to CSV",
    desc: "Turn the emails in a PDF into a clean CSV file for your CRM or spreadsheet.",
  },
  {
    href: "/blog/pdf2emails-vs-manual-copy-paste",
    lang: "EN",
    title: "PDF2Emails vs manual copy-paste: extract 500 emails in 10 seconds",
    desc: "Compare the old way of copy-pasting PDF contacts vs a free, private browser tool.",
  },
  {
    href: "/blog/top-free-pdf-email-extractors",
    lang: "EN",
    title: "Top free tools to extract contact details from a PDF (2026)",
    desc: "The honest shortlist of free PDF email extractors — and which one keeps your file private.",
  },
];

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Blog</h1>
      <p className="mt-2 text-sm text-slate-500">
        Guías para extraer correos de PDFs y mejorar tu prospección.
      </p>
      <div className="mt-6">
        <BlogExtractor />
      </div>
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
