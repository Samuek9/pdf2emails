"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CreditCard, Download, Landmark, ScanSearch, ShieldCheck, UploadCloud } from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PdfDropzone } from "@/components/PdfDropzone";
import { ResultsPanel } from "@/components/ResultsPanel";
import { initAnalytics, trackEvent } from "@/lib/analytics";
import { getClientCountry, getCountryName, getLocalPrice } from "@/lib/countries";
import { parseAllEmails } from "@/lib/emails";
import { getPricing } from "@/lib/pricing";
import { t } from "@/lib/i18n";
import type { Gateway, ParsedPdf } from "@/lib/types";

export default function HomePage() {
  const country = useMemo(() => getClientCountry(), []);
  const pricing = useMemo(() => getPricing(country), [country]);
  const local = useMemo(() => getLocalPrice(country), [country]);

  const [parsed, setParsed] = useState<ParsedPdf | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lockedCount, setLockedCount] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    void initAnalytics();
    trackEvent("page_viewed", { country, region: pricing.region });
    if (window.localStorage.getItem("pdf2emails_unlocked") === "1") {
      setUnlocked(true);
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParsed = useCallback((text: string, numPages: number, fileName: string) => {
    const { all, totalRaw } = parseAllEmails(text);
    setParsed({ text, numPages, fileName, all, totalRaw });
    setDownloaded(false);
    setLockedCount(0);
    setUnlocked(window.localStorage.getItem("pdf2emails_unlocked") === "1");
  }, []);

  const handleReset = useCallback(() => {
    setParsed(null);
    setDownloaded(false);
    setLockedCount(0);
  }, []);

  const handleRequestUnlock = useCallback((count: number) => {
    setLockedCount(count);
    setCheckoutOpen(true);
  }, []);

  const handlePaymentSuccess = useCallback((gateway: Gateway | "demo") => {
    window.localStorage.setItem("pdf2emails_unlocked", "1");
    setUnlocked(true);
    setCheckoutOpen(false);
    setDownloaded(false);
    trackEvent("unlock_applied", { gateway });
  }, []);

  const handleDownloaded = useCallback(() => {
    setDownloaded(true);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <ShieldCheck size={14} />
            {t("hero.badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {t("hero.title1")} <span className="text-emerald-400">{t("hero.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("hero.sub")}

          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#extractor" className="btn-primary !px-8 !py-3.5 !text-base">
              {t("hero.cta")}
              <ArrowRight size={18} />
            </a>
            <span className="text-xs text-slate-400">
              {t("hero.note")} {pricing.displayPrice}
            </span>
          </div>
        </div>
      </section>

      <section id="extractor" className="mt-8 scroll-mt-20">
        {!parsed ? (
          <div className="card p-6 sm:p-10">
            <PdfDropzone onParsed={handleParsed} />
          </div>
        ) : (
          <ResultsPanel
            parsed={parsed}
            unlocked={unlocked}
            pricing={pricing}
            onRequestUnlock={handleRequestUnlock}
            onDownloaded={handleDownloaded}
            onReset={handleReset}
          />
        )}
      </section>

      {downloaded && unlocked && parsed && (
        <div className="mx-auto mt-6 max-w-xl">
          <FeedbackWidget />
        </div>
      )}

      <section id="como-funciona" className="mt-24 scroll-mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          {t("how.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          {t("how.sub")}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Step
            index={1}
            icon={<UploadCloud size={22} />}
            title={t("how.step1.title")}
            description={t("how.step1.desc")}
          />
          <Step
            index={2}
            icon={<ScanSearch size={22} />}
            title={t("how.step2.title")}
            description={t("how.step2.desc")}
          />
          <Step
            index={3}
            icon={<Download size={22} />}
            title={t("how.step3.title")}
            description={t("how.step3.desc")}
          />
        </div>
      </section>

      <section id="precios" className="mt-24 scroll-mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          {t("pricing.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">
          {t("pricing.sub", { price: pricing.displayPrice })}
          
        </p>
        <div className="mx-auto mt-10 max-w-md">
          <div className="card relative p-6 ring-2 ring-emerald-500">
            <span className="absolute -top-3 left-5 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white">
              {t("pricing.yourPrice")}
            </span>
            {pricing.region === "latam" ? (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{t("pricing.latam")}</p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                  $7.99 <span className="text-lg font-semibold text-slate-400">USD</span>
                </p>
                {local && <p className="mt-1 text-sm font-semibold text-slate-500">≈ {local.amount} {local.currency}</p>}
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>✓ {t("pricing.f1")}</li>
                  <li>✓ {t("pricing.f2")}</li>
                </ul>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Landmark size={14} /> dLocal Go
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("pricing.row")}</p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                  $19 <span className="text-lg font-semibold text-slate-400">USD</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Pago único · sin suscripción</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>✓ {t("pricing.f4")}</li>
                  <li>✓ Precio estándar global</li>
                  <li>✓ {t("pricing.f5")}</li>
                </ul>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <CreditCard size={14} /> Wompi
                </p>
              </>
            )}
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">
          {t("pricing.note", { country: getCountryName(country) })}

        </p>
      </section>

      <section id="faq" className="mx-auto mt-24 max-w-3xl scroll-mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          {t("faq.title")}
        </h2>
        <div className="mt-8 space-y-3">
          <FaqItem
            q={t("faq.q1")}
            a={t("faq.a1")}
          />
          <FaqItem
            q={t("faq.q2")}
            a={t("faq.a2")}
          />
          <FaqItem
            q={t("faq.q3")}
            a={t("faq.a3")}
          />
          <FaqItem
            q={t("faq.q4")}
            a={t("faq.a4")}
          />
          <FaqItem
            q={t("faq.q5")}
            a={t("faq.a5")}
          />
        </div>
      </section>

      <section className="mt-24 rounded-3xl bg-emerald-600 px-6 py-14 text-center text-white">
        <h2 className="text-3xl font-extrabold tracking-tight">{t("cta.title")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-100">
          {t("cta.sub")}
        </p>
        <a
          href="#extractor"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
        >
          {t("cta.btn")} <ArrowRight size={18} />
        </a>
      </section>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handlePaymentSuccess}
        country={country}
        lockedCount={lockedCount}
      />
    </>
  );
}

function Step({
  index,
  icon,
  title,
  description,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        {icon}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-600">{t("how.stepLabel", { n: index })}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="card group p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        {q}
        <span className="text-lg text-slate-400 transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{a}</p>
    </details>
  );
}
