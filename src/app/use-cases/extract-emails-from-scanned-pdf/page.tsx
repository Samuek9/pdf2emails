import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extract emails from a scanned PDF (OCR) — online free",
  description:
    "Extract every email from a scanned PDF with OCR, 100% free and in your browser. No signup, no uploads, export to CSV or TXT.",
  alternates: { canonical: "/use-cases/extract-emails-from-scanned-pdf" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extract emails from a scanned PDF (OCR)
      </h1>
      <p className="mt-3 text-sm text-slate-500">Tool · Free · No signup</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Scanned PDFs (images) don't have selectable text, so most tools fail. With{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>,
          if your PDF is a scan we automatically offer <strong>OCR</strong> to read the text and
          extract every email inside.
        </p>
        <p>
          Works fully in your browser — the file never leaves your device. Free for small PDFs, and
          you can clean &amp; verify the list to protect your domain from spam blocks.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Extract emails from a scanned PDF →
          </Link>
        </div>
      </div>
    </div>
  );
}
