import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PDF to CSV email extractor — convert contacts free",
  description:
    "Turn the emails inside a PDF into a clean CSV file. Free, in your browser, no signup. Filter generic and personal emails and export.",
  alternates: { canonical: "/use-cases/pdf-to-csv-email-extractor" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        PDF to CSV email extractor
      </h1>
      <p className="mt-3 text-sm text-slate-500">Tool · Free · No signup</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Need the contacts from a PDF as a spreadsheet?{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>{" "}
          converts every email in a PDF to a clean <strong>CSV</strong> in seconds — ready for Excel,
          Google Sheets or your CRM.
        </p>
        <p>
          Filter out generic (info@, support@) and personal (@gmail.com) emails, and optionally clean
          &amp; verify the list to avoid bounces and protect your domain.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Convert PDF to CSV →
          </Link>
        </div>
      </div>
    </div>
  );
}
