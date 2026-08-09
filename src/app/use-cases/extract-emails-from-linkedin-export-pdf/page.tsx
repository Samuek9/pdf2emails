import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extract emails from a LinkedIn export PDF",
  description:
    "Extract every email from a LinkedIn contacts/export PDF in seconds. 100% private (runs in your browser), no uploads, export to CSV, TXT or Excel.",
  alternates: { canonical: "/use-cases/extract-emails-from-linkedin-export-pdf" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extract emails from a LinkedIn export PDF
      </h1>
      <p className="mt-3 text-sm text-slate-500">Tool · Free · 100% private</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Recruiters and sales pros often get LinkedIn contact lists as PDFs. With{" "}
          <Link href="/" className="font-semibold text-emerald-600 hover:underline">PDF2Emails</Link>,
          extract every email in seconds — and because it runs <strong>100% in your browser</strong>,
          your export never leaves your device.
        </p>
        <p>
          Filter generic and personal emails, clean &amp; verify the list, and export to CSV, TXT or
          Excel for your CRM or outreach sequences.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Extract emails from a LinkedIn export →
          </Link>
        </div>
      </div>
    </div>
  );
}
