import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to extract contacts from a PDF to CSV",
  description:
    "Extract all contacts (emails) from a PDF to a clean CSV file quickly and for free. No uploads, no signup, works in your browser.",
  alternates: { canonical: "/blog/extract-contacts-from-pdf-to-csv" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        How to extract contacts from a PDF to CSV
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guide · 2 min read</p>
      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          Got a PDF full of contacts and need them in a spreadsheet? Convert the emails inside it to a
          clean <strong>CSV</strong> with{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link> —
          free, fast, and everything runs in your browser.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Why CSV?</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Import directly into Google Sheets, Excel or your CRM.</li>
          <li>Feed email marketing tools.</li>
          <li>Keep your data private (no uploads).</li>
        </ul>
        <p>First 5 emails are free, no signup. OCR available for scans.</p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Extract contacts to CSV →
          </Link>
        </div>
      </div>
    </article>
  );
}
