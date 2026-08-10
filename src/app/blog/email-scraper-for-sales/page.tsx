import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is an email scraper and how to use it for sales",
  description:
    "Discover what an email scraper is, why extracting emails from documents helps sales, and how to do it legally and easily with a browser tool.",
  alternates: { canonical: "/blog/email-scraper-for-sales" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        What is an email scraper and how to use it for sales
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guide · 3 min read</p>

      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          An <strong>email scraper</strong> extracts email addresses from a document or source. If you
          work in sales, prospecting, or B2B marketing, turning PDFs full of contacts into a clean
          email list can save you hours and power your <strong>cold email</strong> outreach.
        </p>
        <h2 className="text-xl font-bold text-slate-900">How it helps sales</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Build prospect lists from directories or trade-show PDFs.</li>
          <li>Consolidate supplier and client contacts.</li>
          <li>Feed your CRM or email marketing tool.</li>
        </ul>
        <h2 className="text-xl font-bold text-slate-900">A quick legal note</h2>
        <p>
          Extracting emails is totally legal when you <strong>already have the document</strong> (for
          example, a directory you were given). Always follow data protection rules and never use
          lists for unsolicited spam.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Do it in seconds with PDF2Emails</h2>
        <p>
          Drop your PDF in{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>{" "}
          and get an email list ready for CSV. Filter generic and personal emails, and download the
          full list to start prospecting today.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-semibold text-slate-800">Start for free</p>
          <p className="mt-1 text-sm text-slate-500">Free for small PDFs (up to 5 pages and 50 emails), no signup.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Try PDF2Emails →
          </Link>
        </div>
      </div>
    </article>
  );
}
