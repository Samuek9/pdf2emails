import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using PDF2Emails.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-slate-700">
      <h1 className="text-2xl font-extrabold text-slate-900">Terms &amp; Conditions</h1>
      <p>Last updated: August 2026</p>
      <p>
        PDF2Emails ("we", "us") provides a client-side utility that extracts email addresses from PDF
        documents in your browser. By using our service you agree to these terms.
      </p>
      <h2 className="text-lg font-bold text-slate-900">1. Service "as-is"</h2>
      <p>
        The tool is provided on an "as-is" and "as-available" basis, without warranties of any kind.
        We do not guarantee the completeness or accuracy of the extraction results.
      </p>
      <h2 className="text-lg font-bold text-slate-900">2. User responsibility</h2>
      <p>
        You are solely responsible for how you use the extracted data. You must comply with all
        applicable laws (including data protection and anti-spam regulations) and you must not use
        extracted emails for unsolicited spam.
      </p>
      <h2 className="text-lg font-bold text-slate-900">3. Verification</h2>
      <p>
        Optional email verification is performed using third-party providers and is provided for
        convenience. Verification results are best-effort and not a guarantee of deliverability.
      </p>
      <h2 className="text-lg font-bold text-slate-900">4. Payments &amp; refunds</h2>
      <p>
        Payments are processed by third-party providers (Wompi, dLocal Go). Because this is digital
        content delivered instantly, purchases are generally non-refundable. Contact us if you
        believe there was an error.
      </p>
      <h2 className="text-lg font-bold text-slate-900">5. Contact</h2>
      <p>Support: soporte@pdf2emails.com</p>
    </div>
  );
}
