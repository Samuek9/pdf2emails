import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for PDF2Emails. Your files are processed locally and never uploaded.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-slate-700">
      <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p>Last updated: August 2026</p>
      <h2 className="text-lg font-bold text-slate-900">Your PDFs are private</h2>
      <p>
        The core feature of PDF2Emails is that your PDF files are processed <strong>locally in your
        browser</strong> using pdf.js. Your files are <strong>never uploaded to or stored on our
        servers</strong>.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Data we collect</h2>
      <p>
        We only collect the minimum needed to provide and improve the service:
      </p>
      <ul className="list-disc pl-5">
        <li>The email address you provide when purchasing an upgrade or leaving your email.</li>
        <li>Aggregated, anonymous analytics (page views, feature usage) to understand how the tool is used.</li>
        <li>Country (from your IP) to show the correct language and prices.</li>
      </ul>
      <h2 className="text-lg font-bold text-slate-900">Processing for verification</h2>
      <p>
        If you purchase the optional verification upgrade, the extracted email addresses are sent to a
        third-party verification provider for the sole purpose of checking deliverability. We do not
        sell or rent your data.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Cookies</h2>
      <p>
        We use a cookie to remember your preferred language/country. Analytics tools may also set
        cookies.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Contact</h2>
      <p>Support &amp; privacy questions: soporte@pdf2emails.com</p>
    </div>
  );
}
