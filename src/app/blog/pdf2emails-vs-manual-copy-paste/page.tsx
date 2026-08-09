import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PDF2Emails vs manual copy-paste: extract 500 emails in 10 seconds",
  description:
    "Stop copy-pasting emails from PDFs by hand. See how to extract 500 contacts from a PDF in 10 seconds, 100% privately and for free.",
  alternates: { canonical: "/blog/pdf2emails-vs-manual-copy-paste" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-600 hover:underline">
        ← Back to Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        PDF2Emails vs manual copy-paste: extract 500 emails in 10 seconds
      </h1>
      <p className="mt-3 text-sm text-slate-500">Comparison · 2 min read</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Copying email addresses from a 40-page PDF by hand takes hours and invites errors. Here is
          what manual work looks like vs. doing it with a browser tool.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2">Task</th>
                <th className="px-4 py-2">Manual</th>
                <th className="px-4 py-2">PDF2Emails</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="px-4 py-2">Extract 500 emails</td><td className="px-4 py-2">1–2 hours</td><td className="px-4 py-2 text-emerald-600">10 seconds</td></tr>
              <tr className="border-b"><td className="px-4 py-2">Filter generic/personal</td><td className="px-4 py-2">Manual delete</td><td className="px-4 py-2 text-emerald-600">One click</td></tr>
              <tr className="border-b"><td className="px-4 py-2">Export to CSV</td><td className="px-4 py-2">Retype</td><td className="px-4 py-2 text-emerald-600">One click</td></tr>
              <tr><td className="px-4 py-2">File privacy</td><td className="px-4 py-2">—</td><td className="px-4 py-2 text-emerald-600">Never leaves your device</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Try it free:{" "}
          <Link href="/" className="font-semibold text-emerald-600 hover:underline">PDF2Emails</Link>{" "}
          extracts, filters, cleans and exports in your browser — no uploads, no signup.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link href="/" className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
            Extract emails from a PDF →
          </Link>
        </div>
      </div>
    </article>
  );
}
