"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CreditCard,
  Download,
  Landmark,
  ScanSearch,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { copyToClipboard, downloadBlob, downloadXlsx, toCsv, toTxt } from "@/lib/csv";
import { PdfDropzone } from "@/components/PdfDropzone";
import { ResultsPanel } from "@/components/ResultsPanel";
import type { FreeAction } from "@/components/ResultsPanel";
import { StatsBar } from "@/components/StatsBar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { VerifyModal } from "@/components/VerifyModal";
import { initAnalytics, trackEvent } from "@/lib/analytics";
import { getClientCountry, getCountryName } from "@/lib/countries";
import { getPricing } from "@/lib/pricing";
import { useLocalPrice } from "@/lib/fx";
import { parseAllEmails } from "@/lib/emails";
import { t } from "@/lib/i18n";
import type { ParsedPdf } from "@/lib/types";

export default function HomePage() {
  // Pais como estado con default estable (US) en server y primer render del
  // cliente para evitar hydration mismatch. Se resuelve el real tras el montaje.
  const [country, setCountry] = useState<string>("US");
  const pricing = useMemo(() => getPricing(country), [country]);
  const localPrice = useLocalPrice(country, pricing.priceUsd);

  useEffect(() => {
    setCountry(getClientCountry());
  }, []);
  const [parsed, setParsed] = useState<ParsedPdf | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(3.99);
  const [checkoutOption, setCheckoutOption] = useState<"full" | "fullverify" | "cart">("full");
  const [cartSel, setCartSel] = useState<{ verify: boolean; enrich: boolean; clean: boolean; phones: boolean; templates: boolean }>({ verify: true, enrich: false, clean: false, phones: false, templates: false });
  const [cartEmail, setCartEmail] = useState("");

  useEffect(() => {
    void initAnalytics();
    trackEvent("page_viewed", { country });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Desbloqueo de pago: detecta el retorno de dLocal (?paid=1) y restaura la
  // persistencia de localStorage. Se hace tras el montaje para no romper hydration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const justPaid = params.get("paid") === "1";
    const prevUnlocked = window.localStorage.getItem("pdf2emails_unlocked") === "1";
    if (justPaid || prevUnlocked) {
      window.localStorage.setItem("pdf2emails_unlocked", "1");
      setUnlocked(true);
    }
    if (justPaid) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Restaura la sesion extraida si venimos de vuelta de dLocal (la RAM se perdio).
  // Restaura la sesion extraida si venimos de vuelta de dLocal (la RAM se perdio).
  // Guardamos en sessionStorage (por pestaña) Y en localStorage (para sobrevivir
  // al viaje a checkout.dlocalgo.com y volver). localStorage se valida por TTL
  // (30 min) para no mostrar resultados obsoletos en visitas posteriores.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("pdf2emails_session");
      if (raw) {
        const data = JSON.parse(raw);
        const fresh = data && Array.isArray(data.all) && Date.now() - (data.at || 0) < 30 * 60 * 1000;
        if (fresh) setParsed(data);
        else window.localStorage.removeItem("pdf2emails_session");
      }
    } catch { /* noop */ }
  }, []);

  const handleParsed = useCallback((text: string, numPages: number, fileName: string) => {
    const { all, totalRaw } = parseAllEmails(text);
    try { const prev = Number(window.localStorage.getItem("pdf2emails_count") || 0); window.localStorage.setItem("pdf2emails_count", String(prev + all.length)); } catch { /* noop */ }
    const data = { text, numPages, fileName, all, totalRaw, at: Date.now() };
    setParsed(data);
    // Persistir en localStorage para sobrevivir al cruce de dominio (checkout
    // de dLocal) y al "back". Se valida con TTL al restaurar.
    try { window.localStorage.setItem("pdf2emails_session", JSON.stringify(data)); } catch { /* overflow: se ignora */ }
    setDownloaded(false);
  }, []);

  const handleReset = useCallback(() => {
    setParsed(null);
    setDownloaded(false);
    try { window.localStorage.removeItem("pdf2emails_session"); } catch { /* noop */ }
  }, []);

  const handleDownloaded = useCallback(() => {
    setDownloaded(true);
  }, []);

  // Accion gratuita que el usuario queria hacer (copy/csv/excel/verify) antes
  // de abrir el modal de upsell. Al "skip" del modal se ejecuta esa accion.
  const [freeAction, setFreeAction] = useState<FreeAction>("csv");

  const handleVerify = useCallback((action: FreeAction) => {
    setFreeAction(action);
    setVerifyOpen(true);
  }, []);

  const handleFreeDownload = useCallback(() => {
    if (parsed) {
      const emails = parsed.all.map((e) => e.email);
      const base = parsed.fileName.replace(/\.pdf$/i, "") || "emails";
      if (freeAction === "copy") {
        void copyToClipboard(emails.join("\n"));
      } else if (freeAction === "excel") {
        void downloadXlsx(emails);
      } else if (freeAction === "txt") {
        downloadBlob(`${base}-correos.txt`, toTxt(emails), "text/plain;charset=utf-8");
      } else {
        downloadBlob(`${base}-correos.csv`, toCsv(emails), "text/csv;charset=utf-8");
      }
      trackEvent("csv_downloaded", {
        format: freeAction === "excel" ? "excel" : freeAction === "txt" ? "txt" : "csv",
        totalEmails: emails.length,
      });
    }
    setVerifyOpen(false);
  }, [parsed, freeAction]);

  const handleUnlock = useCallback(
    (option: "full" | "fullverify") => {
      setCheckoutOption(option);
      setCheckoutAmount(option === "fullverify" ? pricing.verifyPriceUsd : pricing.priceUsd);
      setCheckoutOpen(true);
    },
    [pricing],
  );

  const handlePaymentSuccess = useCallback(
    (gateway: "wompi" | "dlocal" | "demo") => {
      setCheckoutOpen(false);
      if (checkoutOption === "full" || checkoutOption === "fullverify") {
        window.localStorage.setItem("pdf2emails_unlocked", "1");
        setUnlocked(true);
      }
      trackEvent("payment_successful", { gateway, amount: checkoutAmount, option: checkoutOption });
      if (parsed) {
        const emails = parsed.all.map((e) => e.email);
        if (checkoutOption === "cart") {
          void fetch("/api/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails, text: parsed.text, options: { verify: cartSel.verify, clean: cartSel.clean, enrich: cartSel.enrich, phones: cartSel.phones } }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { csv?: string } | null) => {
              if (d?.csv) downloadBlob("lista-procesada.csv", d.csv, "text/csv;charset=utf-8");
              if (cartSel.templates) {
                void fetch("/cold-email-templates.md")
                  .then((r) => r.text())
                  .then((txt) => downloadBlob("cold-email-templates.md", txt, "text/markdown;charset=utf-8"))
                  .catch(() => {});
              }
            })
            .catch(() => {});
        } else if (checkoutOption === "fullverify") {
          void fetch("/api/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails, options: { verify: true, clean: true, enrich: false } }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { csv?: string } | null) => {
              if (d?.csv) downloadBlob("lista-verificada.csv", d.csv, "text/csv;charset=utf-8");
            })
            .catch(() => {});
        }
      }
      // Página de confirmación post-compra: URL estable para tracking de
      // conversión (Google Ads / Analytics). Delay para dejar iniciar descargas.
      window.setTimeout(() => {
        window.location.assign("/thank-you");
      }, 1200);
    },
    [checkoutAmount, checkoutOption, parsed, cartSel],
  );



  const handleCartCheckout = useCallback(
    (amount: number, sel: { verify: boolean; enrich: boolean; clean: boolean; phones: boolean; templates: boolean }, email: string) => {
      setCartSel(sel);
      setCartEmail(email);
      setCheckoutAmount(amount);
      setCheckoutOption("cart");
      setVerifyOpen(false);
      setCheckoutOpen(true);
    },
    [],
  );

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
            <span className="text-xs text-slate-500">{t("hero.note")}</span>
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
            onDownloaded={handleDownloaded}
            onVerify={handleVerify}
            onUnlock={handleUnlock}
            onReset={handleReset}
            fullPrice={pricing.priceUsd}
            verifyPrice={pricing.verifyPriceUsd}
          />
        )}
      </section>

      <StatsBar />

      {downloaded && parsed && (
        <div className="mx-auto mt-6 max-w-xl">
          <FeedbackWidget />
        </div>
      )}

      <section id="como-funciona" className="mt-24 scroll-mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          {t("how.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">{t("how.sub")}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Step index={1} icon={<UploadCloud size={22} />} title={t("how.step1.title")} description={t("how.step1.desc")} />
          <Step index={2} icon={<ScanSearch size={22} />} title={t("how.step2.title")} description={t("how.step2.desc")} />
          <Step index={3} icon={<Download size={22} />} title={t("how.step3.title")} description={t("how.step3.desc")} />
        </div>
      </section>

      <section id="testimonios" className="mt-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">{t("testi.title")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <figure key={i} className="card flex flex-col p-6">
              <div className="text-amber-400" aria-label="5 stars">★★★★★</div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                “{t(`testi.${i}.quote`)}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="block font-bold text-slate-800">{t(`testi.${i}.name`)}</span>
                <span className="block text-xs text-slate-500">{t(`testi.${i}.role`)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="precios" className="mt-24 scroll-mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          {t("pricing.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">
          {t("pricing.sub2")}
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
          <div className="card relative p-6">
            <span className="absolute -top-3 left-5 rounded-full bg-slate-600 px-3 py-1 text-[11px] font-bold text-white">
              {t("pricing.freeTitle")}
            </span>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">{t("pricing.freePrice")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{t("pricing.freeSub")}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>✓ {t("pricing.freeF1")}</li>
              <li>✓ {t("pricing.freeF2")}</li>
              <li>✓ {t("pricing.freeF3")}</li>
            </ul>
          </div>
          <div className="card relative p-6 ring-2 ring-emerald-500">
            <span className="absolute -top-3 left-5 rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white">
              {t("pricing.yourPrice")}
            </span>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              ${Number.isInteger(pricing.priceUsd) ? pricing.priceUsd : pricing.priceUsd.toFixed(2)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {pricing.region === "latam" ? t("pricing.latam") : t("pricing.row")}
            </p>
            {pricing.region === "latam" && localPrice && (
              <p className="mt-2 inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                ≈ {localPrice.amount} {localPrice.currency}
              </p>
            )}
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>✓ {t("pricing.f3")}</li>
              <li>✓ {t("pricing.f1")}</li>
              <li>✓ {t("pricing.f4")}</li>
            </ul>
          </div>

          <div className="card relative p-6">
            <span className="absolute -top-3 left-5 rounded-full bg-slate-700 px-3 py-1 text-[11px] font-bold text-white">
              {t("pricing.verifyTitle")}
            </span>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              ${Number.isInteger(pricing.verifyOnlyUsd) ? pricing.verifyOnlyUsd : pricing.verifyOnlyUsd.toFixed(2)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{t("pricing.verifySub")}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ShieldCheck size={14} className="text-emerald-700" /> {t("verify.price")}
            </p>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-slate-500">
          {t("pricing.note", { country: getCountryName(country) })}
        </p>
      </section>

      <section id="faq" className="mx-auto mt-24 max-w-3xl scroll-mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">{t("faq.title")}</h2>
        <div className="mt-8 space-y-3">
          <FaqItem q={t("faq.q1")} a={t("faq.a1")} />
          <FaqItem q={t("faq.q2")} a={t("faq.a2")} />
          <FaqItem q={t("faq.q3")} a={t("faq.a3")} />
          <FaqItem q={t("faq.q4")} a={t("faq.a4")} />
          <FaqItem q={t("faq.q5")} a={t("faq.a5")} />
        </div>
      </section>

      <section className="mt-24 rounded-3xl bg-emerald-700 px-6 py-14 text-center text-white">
        <h2 className="text-3xl font-extrabold tracking-tight">{t("cta.title")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/90">{t("cta.sub")}</p>
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
        lockedCount={parsed ? Math.max(0, parsed.all.length - 10) : 0}
        amount={checkoutAmount}
      />
      <VerifyModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        emailsCount={parsed ? parsed.all.length : 0}
        emails={parsed ? parsed.all.map((e) => e.email) : []}
        country={country}
        onCheckout={handleCartCheckout}
        onFreeDownload={handleFreeDownload}
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
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-700">
        {t("how.stepLabel", { n: index })}
      </p>
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
        <span className="text-lg text-slate-500 transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{a}</p>
    </details>
  );
}