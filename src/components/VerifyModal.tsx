"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { isLatam } from "@/lib/countries";
import { t } from "@/lib/i18n";

interface VerifyModalProps {
  open: boolean;
  onClose: () => void;
  emailsCount: number;
  emails: string[];
  country: string;
  onCheckout: (amount: number, sel: { verify: boolean; enrich: boolean; clean: boolean; phones: boolean; templates: boolean }, email: string) => void;
  onFreeDownload: () => void;
}

type Selection = { verify: boolean; enrich: boolean; clean: boolean; phones: boolean; templates: boolean };

export function VerifyModal({ open, onClose, emailsCount, emails, country, onCheckout, onFreeDownload }: VerifyModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [sel, setSel] = useState<Selection>({ verify: true, enrich: false, clean: false, phones: false, templates: false });
  const [bundle, setBundle] = useState(false);
  const latam = isLatam(country);
  const prices = { verify: latam ? 2.49 : 4.99, enrich: latam ? 4.99 : 9.99, clean: latam ? 1.49 : 2.99, phones: latam ? 1.99 : 3.99, templates: 4.99 };
  const bundlePrice = latam ? 11.99 : 19.99;
  const selectBundle = () => { setSel({ verify: true, enrich: true, clean: true, phones: true, templates: true }); setBundle(true); };;

  if (!open) return null;

  const total = bundle ? bundlePrice : (sel.verify ? prices.verify : 0) + (sel.enrich ? prices.enrich : 0) + (sel.clean ? prices.clean : 0) + (sel.phones ? prices.phones : 0) + (sel.templates ? prices.templates : 0);

  const toggle = (key: keyof Selection) => { setBundle(false); setSel((s) => ({ ...s, [key]: !s[key] })); };

  async function submit() {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("cart.emailError"));
      return;
    }
    setError(null);
    setSubmitting(true);
    trackEvent("upsell_submitted", {
      emails_count: emailsCount,
      verify: sel.verify,
      enrich: sel.enrich,
      clean: sel.clean,
      phones: sel.phones,
      templates: sel.templates,
      total_usd: total,
    });
    try {
      const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      if (formId) {
        const fd = new FormData();
        fd.append("email", trimmed);
        fd.append("emailsCount", String(emailsCount));
        fd.append("verify", sel.verify ? "yes" : "no");
        fd.append("enrich", sel.enrich ? "yes" : "no");
        fd.append("clean", sel.clean ? "yes" : "no");
        fd.append("total", total.toFixed(2));
        fd.append("_subject", "PDF2Emails - upsell");
        await fetch(`https://formspree.io/f/${formId}`, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
      } else {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, emailsCount, ...sel, total }),
        });
      }
    } catch {
      // noop
    }

    setSubmitting(false);
    if (total > 0) {
      // Cobro real: pasa al checkout (Wompi/dLocal) con el total del carrito.
      onCheckout(total, sel, trimmed);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">{t("cart.success", { email })}</h3>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{t("cart.title")}</h3>
            <p className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" /> {t("verify.found", { n: emailsCount })}
            </p>

            <button type="button" onClick={selectBundle} className="mb-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
              ⚡ {t("cart.bundle")} — ${bundlePrice.toFixed(2)}
            </button>
            <div className="mt-4 space-y-2">
              <Row label={t("cart.free")} price={t("cart.freePrice")} />
              <Row
                label={t("cart.verify")}
                price={`+ $${prices.verify.toFixed(2)}`}
                checked={sel.verify}
                onChange={() => toggle("verify")}
                recommended
              />
              <Row label={t("cart.enrich")} price={`+ $${prices.enrich.toFixed(2)}`} checked={sel.enrich} onChange={() => toggle("enrich")} />
              <Row label={t("cart.clean")} price={`+ $${prices.clean.toFixed(2)}`} checked={sel.clean} onChange={() => toggle("clean")} />
              <Row label={t("cart.phones")} price={`+ $${prices.phones.toFixed(2)}`} checked={sel.phones} onChange={() => toggle("phones")} />
              <Row label={t("cart.templates")} price={`+ $${prices.templates.toFixed(2)}`} checked={sel.templates} onChange={() => toggle("templates")} />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-5 py-3 text-white">
              <span className="text-sm font-semibold">{t("cart.total")}</span>
              <span className="text-lg font-extrabold">${total.toFixed(2)}</span>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">{t("cart.emailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="tu@correo.com"
            />
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

            <button onClick={() => void submit()} disabled={submitting} className="btn-primary mt-4 w-full">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}{" "}
              {t("cart.cta")}
            </button>
            <button type="button" onClick={onFreeDownload} className="mt-3 w-full text-center text-xs font-medium text-slate-400 underline underline-offset-2 hover:text-slate-600">
              {t("cart.skip")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  price,
  checked,
  onChange,
  recommended,
}: {
  label: string;
  price: string;
  checked?: boolean;
  onChange?: () => void;
  recommended?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${
        checked ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-emerald-600"
        checked={!!checked}
        disabled={!onChange}
        onChange={onChange}
      />
      <span className="flex-1 text-slate-700">
        {label}
        {recommended && (
          <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
            ✓
          </span>
        )}
      </span>
      <span className="font-semibold text-slate-800">{price}</span>
    </label>
  );
}