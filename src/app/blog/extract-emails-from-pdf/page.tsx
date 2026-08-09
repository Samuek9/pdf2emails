import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to extract emails from a PDF for free and fast",
  description:
    "Learn how to extract every email from a PDF online, for free and without uploading files. Filter generic and personal emails and export to CSV or TXT.",
  alternates: { canonical: "/blog/extract-emails-from-pdf" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-600 hover:underline">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        How to extract emails from a PDF for free and fast
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guide · 3 min read</p>

      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          PDFs are everywhere: directories, catalogs, invoices, resumes. But when you need the{" "}
          <strong>emails inside them</strong>, copying them one by one is painful. Here is the fastest
          and safest way to do it.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Why extract emails from a PDF?</h2>
        <p>
          Building prospect lists for sales or marketing, consolidating supplier contacts, or feeding
          your CRM and email marketing tool with clean CSV data.
        </p>
        <h2 className="text-xl font-bold text-slate-900">The easy way: an online tool</h2>
        <p>
          No installation needed. With{" "}
          <Link href="/" className="font-semibold text-emerald-600 hover:underline">PDF2Emails</Link>,
          just drop your PDF and it detects <strong>all emails</strong> in seconds. Filter out generic
          (info@, support@…) and personal (@gmail.com) ones, and export to <strong>CSV or TXT</strong>.
          Everything runs in your browser — the file never leaves your device.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Step by step</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open PDF2Emails and drop your PDF (or use the sample).</li>
          <li>Review the first 5 emails for free.</li>
          <li>Enable the generic/personal filters if needed.</li>
          <li>Unlock the full list and download the CSV or TXT.</li>
        </ol>
        <h2 className="text-xl font-bold text-slate-900">What if the PDF is a scan?</h2>
        <p>
          If your PDF is a scanned image with no selectable text, enable <strong>OCR</strong> to read
          the text and extract the emails anyway.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-semibold text-slate-800">Try the tool for free now</p>
          <p className="mt-1 text-sm text-slate-500">First 5 emails free, no signup.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Extract emails from a PDF →
          </Link>
        </div>
      </div>
    </article>
  );
}
