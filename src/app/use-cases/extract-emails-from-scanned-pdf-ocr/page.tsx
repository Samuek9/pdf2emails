import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extract emails from a scanned PDF with OCR — free",
  description:
    "Turn a scanned PDF (image) into a clean email list using OCR, 100% free and private in your browser. No uploads, no signup, export to CSV or Excel.",
  alternates: { canonical: "/use-cases/extract-emails-from-scanned-pdf-ocr" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extract emails from a scanned PDF with OCR
      </h1>
      <p className="mt-3 text-sm text-slate-500">Tool · Free · OCR included</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Scanned PDFs are images with no selectable text — most tools fail.{" "}
          <Link href="/" className="font-semibold text-emerald-600 hover:underline">PDF2Emails</Link>{" "}
          detects scans and runs <strong>OCR in your browser</strong> to read the text and extract
          every email.
        </p>
        <p>
          Private (no uploads), free for small PDFs, and you can clean &amp; verify the list to
          protect your domain from spam blocks.
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
