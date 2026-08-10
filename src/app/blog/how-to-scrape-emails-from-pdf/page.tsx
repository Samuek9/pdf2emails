import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to scrape emails from a PDF (easy guide)",
  description:
    "Learn how to scrape emails from a PDF quickly, for free and without uploading files. Filter generic and personal emails and export to CSV.",
  alternates: { canonical: "/blog/how-to-scrape-emails-from-pdf" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        How to scrape emails from a PDF (easy guide)
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guide · 2 min read</p>
      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          Scraping emails from a PDF is easy when you have the right tool. With{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>,
          drop your PDF and get every email in seconds — <strong>no server uploads</strong>.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Drop your PDF (or use the sample).</li>
          <li>Review the emails — small PDFs (up to 5 pages and 50 emails) are 100% free.</li>
          <li>Filter generic and personal emails.</li>
          <li>Download the full list as CSV or TXT.</li>
        </ol>
        <p>For scanned PDFs, enable <strong>OCR</strong>.</p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Scrape emails from a PDF →
          </Link>
        </div>
      </div>
    </article>
  );
}
