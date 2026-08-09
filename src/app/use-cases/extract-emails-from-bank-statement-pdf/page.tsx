import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extract emails from a bank statement PDF",
  description:
    "Extract all emails from a bank statement or invoice PDF in seconds. Free, private (runs in your browser), export to CSV.",
  alternates: { canonical: "/use-cases/extract-emails-from-bank-statement-pdf" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extract emails from a bank statement PDF
      </h1>
      <p className="mt-3 text-sm text-slate-500">Tool · Free · Private</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Bank statements and invoice PDFs are full of contact emails. With{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>,
          extract them all in seconds — and because it runs <strong>100% in your browser</strong>, your
          financial documents never leave your device.
        </p>
        <p>Free for small PDFs, no signup, and you can export the list as CSV or TXT.</p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Extract emails from a bank statement →
          </Link>
        </div>
      </div>
    </div>
  );
}
