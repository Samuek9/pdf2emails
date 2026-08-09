"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";

interface VerifyModalProps {
  open: boolean;
  onClose: () => void;
  emailsCount: number;
}

export function VerifyModal({ open, onClose, emailsCount }: VerifyModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function submit() {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("verify.emailError"));
      return;
    }
    setError(null);
    setSubmitting(true);
    trackEvent("verify_intent", { email: trimmed, emailsCount });
    try {
      const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      if (formId) {
        const fd = new FormData();
        fd.append("email", trimmed);
        fd.append("emailsCount", String(emailsCount));
        fd.append("_subject", "PDF2Emails - intencion de verificacion");
        await fetch(`https://formspree.io/f/${formId}`, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
      } else {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, emailsCount }),
        });
      }
    } catch {
      // noop
    }
    setSubmitting(false);
    setDone(true);
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
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
              {t("verify.success", { email })}
            </h3>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{t("verify.title")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("verify.sub")}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <ShieldCheck size={14} className="text-emerald-600" />{" "}
              {t("verify.found", { n: emailsCount })}
            </p>
            <p className="mt-3 text-sm font-bold text-slate-800">{t("verify.price")}</p>
            <label className="mt-4 block text-xs font-semibold text-slate-600">
              {t("verify.emailLabel")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="tu@correo.com"
            />
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
            <button onClick={() => void submit()} disabled={submitting} className="btn-primary mt-4 w-full">
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}{" "}
              {t("verify.cta")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
