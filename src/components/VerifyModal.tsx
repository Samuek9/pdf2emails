"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { isLatam } from "@/lib/countries";
import { CART_PRICES_USD, type CheckoutOption } from "@/lib/orders";
import { t } from "@/lib/i18n";

interface VerifyModalProps {
  open: boolean;
  onClose: () => void;
  emailsCount: number;
  emails: string[];
  country: string;
  onCheckout: (amount: number, option: CheckoutOption, email: string) => void;
  onFreeDownload: () => void;
}

export function VerifyModal({ open, onClose, emailsCount, emails, country, onCheckout, onFreeDownload }: VerifyModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [pkg, setPkg] = useState<"verify" | "pro">("verify");
  const latam = isLatam(country);
  const prices = latam ? CART_PRICES_USD.latam : CART_PRICES_USD.row;
  const bundlePrice = prices.bundle;
  const option: CheckoutOption = pkg === "pro" ? "cartPro" : "cartVerify";
  const sel =
    pkg === "pro"
      ? { verify: true, enrich: true, clean: true, phones: true }
      : { verify: true, enrich: false, clean: true, phones: false };

  if (!open) return null;

  const total = pkg === "pro" ? bundlePrice : prices.verify + prices.clean;

  // El paquete seleccionado determina sel y total (2 opciones claras, sin micropagos).

  async function submit() {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("cart.emailError"));
      return;
    }
    setError(null);
    setSubmitting(true);
    trackEvent("upsell_intent", {
      email: trimmed,
      emailsCount,
      verify: sel.verify,
      enrich: sel.enrich,
      clean: sel.clean,
      totalUsd: total,
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
      // Cobro real: pasa al checkout (PayPal/dLocal). El monto real que se
      // cobra lo vuelve a calcular el servidor a partir de `option` — este
      // `total` es solo para mostrarlo en el modal mientras carga.
      onCheckout(total, option, trimmed);
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

                        <div className="mt-2 space-y-2">
              <PackageCard
                title={t("cart.verify")}
                desc={t("cart.pkgVerifyDesc")}
                price={`${(prices.verify + prices.clean).toFixed(2)}`}
                selected={pkg === "verify"}
                onClick={() => setPkg("verify")}
              />
              <PackageCard
                title={t("cart.pkgProTitle")}
                desc={t("cart.pkgProDesc")}
                price={`${bundlePrice.toFixed(2)}`}
                selected={pkg === "pro"}
                onClick={() => setPkg("pro")}
                recommended
              />
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

function PackageCard({
  title,
  desc,
  price,
  selected,
  onClick,
  recommended,
}: {
  title: string;
  desc: string;
  price: string;
  selected: boolean;
  onClick: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-xl border-2 px-4 py-3 text-left transition ${
        selected ? "border-emerald-500 bg-emerald-50/60" : "border-slate-200 bg-white hover:border-emerald-300"
      }`}
    >
      {recommended && (
        <span className="absolute -top-2 right-3 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">
          ★ {t("cart.recommended")}
        </span>
      )}
      <span className="flex items-center justify-between gap-2">
        <span className="font-bold text-slate-800">{title}</span>
        <span className="font-extrabold text-emerald-700">{price}</span>
      </span>
      <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
    </button>
  );
}
