"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, CreditCard, Landmark, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import { getPricing } from "@/lib/pricing";
import { getLocalPrice } from "@/lib/countries";
import type { Gateway } from "@/lib/types";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (gateway: Gateway | "demo") => void;
  country: string;
  lockedCount: number;
}

type Step = "method" | "processing" | "success";

declare global {
  interface Window {
    WidgetCheckout?: new (config: Record<string, unknown>) => {
      open: (callback: (result: { transaction?: { status: string } }) => void) => void;
    };
  }
}

const GATEWAY_META: Record<Gateway, { name: string; subtitle: string; icon: "card" | "bank" }> = {
  wompi: { name: "Wompi", subtitle: "Visa · Mastercard · Amex (internacional)", icon: "card" },
  dlocal: { name: "dLocal Go", subtitle: "PSE · Pix · OXXO · tarjetas locales", icon: "bank" },
};

export function CheckoutModal({
  open,
  onClose,
  onSuccess,
  country,
  lockedCount,
}: CheckoutModalProps) {
  const pricing = useMemo(() => getPricing(country), [country]);
  const local = getLocalPrice(country);
  const [step, setStep] = useState<Step>("method");
  const [gateway, setGateway] = useState<Gateway>(pricing.primaryGateway);
  const [error, setError] = useState<string | null>(null);
  const [paidGateway, setPaidGateway] = useState<Gateway | "demo">("demo");
  const referenceRef = useRef<string>("");

  const wompiLiveConfigured = Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);
  const [liveConfig, setLiveConfig] = useState<{ wompi: boolean; dlocal: boolean }>({
    wompi: wompiLiveConfigured,
    dlocal: false,
  });

  useEffect(() => {
    if (open) {
      setStep("method");
      setGateway(pricing.primaryGateway);
      setError(null);
      referenceRef.current = `pdf2emails-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }, [open, pricing.primaryGateway]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/payments/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg: { wompi?: boolean; dlocal?: boolean } | null) => {
        if (!cancelled && cfg) {
          setLiveConfig({ wompi: !!cfg.wompi, dlocal: !!cfg.dlocal });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  const demoMode = !(liveConfig.wompi || liveConfig.dlocal);

  if (!open) return null;

  function handleSuccess(gw: Gateway | "demo") {
    setPaidGateway(gw);
    setStep("success");
    trackEvent("payment_successful", {
      gateway: gw,
      price: pricing.displayPrice,
      currency: "USD",
      amountUsd: pricing.priceUsd,
      country,
      region: pricing.region,
    });
  }

  function loadWompiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.WidgetCheckout) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar el widget de Wompi"));
      document.head.appendChild(script);
    });
  }

  async function handlePay() {
    setError(null);
    trackEvent("checkout_clicked", {
      gateway,
      price: pricing.displayPrice,
      currency: "USD",
      amountUsd: pricing.priceUsd,
      country,
      region: pricing.region,
      lockedCount,
    });

    if (gateway === "wompi" && liveConfig.wompi) {
      setStep("processing");
      try {
        await loadWompiScript();
        const intentRes = await fetch("/api/wompi/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountInCents: Math.round(pricing.priceUsd * 100),
            currency: "USD",
            reference: referenceRef.current,
          }),
        });
        if (!intentRes.ok) throw new Error("WOMPI no configurado en el servidor");
        const intent = (await intentRes.json()) as { signature: string };

        const widget = new window.WidgetCheckout!({
          currency: "USD",
          amountInCents: Math.round(pricing.priceUsd * 100),
          reference: referenceRef.current,
          publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
          signature: intent.signature,
          redirectUrl: window.location.origin,
        });
        widget.open((result) => {
          if (result.transaction && result.transaction.status === "APPROVED") {
            handleSuccess("wompi");
          } else {
            setStep("method");
            setError(t("checkout.errWompi"));
          }
        });
      } catch {
        setStep("method");
        setError(t("checkout.errWompiStart"));
      }
      return;
    }

    // Flujo real con dLocal Go (payment link / redirect).
    if (gateway === "dlocal" && liveConfig.dlocal) {
      setStep("processing");
      try {
        const res = await fetch("/api/dlocal/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: pricing.priceUsd,
            currency: "USD",
            country: pricing.countryCode,
            description: "PDF2Emails - desbloqueo de lista completa",
            orderId: referenceRef.current,
          }),
        });
        if (!res.ok) throw new Error("dLocal Go no configurado");
        const intent = (await res.json()) as { redirectUrl: string };
        // Redirigimos al checkout de dLocal Go; al volver (success_url=/ ?paid=1)
        // la landing detecta el pago y desbloquea.
        window.location.href = intent.redirectUrl;
      } catch {
        setStep("method");
        setError(
          t("checkout.errDlocal"),
        );
      }
      return;
    }

    // Modo demo: simula el pago.
    setStep("processing");
    await new Promise((r) => setTimeout(r, 900));
    handleSuccess(gateway === "wompi" ? "wompi" : "demo");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">{t("checkout.approved")}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {t("checkout.approvedSub", { n: lockedCount })}
            </p>
            <button className="btn-primary mt-6 w-full" onClick={() => onSuccess(paidGateway)}>
              {t("checkout.view")} <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-900">{t("checkout.title", { n: lockedCount })}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("checkout.sub")}</p>

            <div className="mt-5 flex items-end justify-between rounded-xl bg-slate-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {t("checkout.total")}
                </p>
                <p className="mt-1 text-3xl font-extrabold">
                  {pricing.region === "latam" ? "$7.99" : "$19"}
                  <span className="text-base font-semibold text-slate-300"> USD</span>
                </p>
              </div>
              {pricing.region === "latam" && (
                <div className="text-right">
                  <p className="text-xs font-medium text-emerald-400">{t("checkout.latamPpp")}</p>
                  {local && <p className="text-sm font-bold">≈ {local.amount} {local.currency}</p>}
                </div>
              )}
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("checkout.payMethod")}
            </p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-500 bg-emerald-50/50 px-4 py-3 ring-1 ring-emerald-500">
              <span className="text-emerald-700">
                {GATEWAY_META[pricing.primaryGateway].icon === "card" ? <CreditCard size={18} /> : <Landmark size={18} />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {GATEWAY_META[pricing.primaryGateway].name}
                </span>
                <span className="block text-xs text-slate-500">
                  {GATEWAY_META[pricing.primaryGateway].subtitle}
                </span>
              </span>
              <Check size={18} className="ml-auto text-emerald-600" />
            </div>

            {step === "processing" ? (
              <div className="btn-primary mt-5 w-full cursor-not-allowed opacity-70">
                <Loader2 size={18} className="animate-spin" /> {t("checkout.processing")}
              </div>
            ) : (
              <button className="btn-primary mt-5 w-full" onClick={() => void handlePay()}>
                <Lock size={16} /> {t("checkout.pay", { price: pricing.region === "latam" ? "$7.99 USD" : "$19 USD" })}
              </button>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            {demoMode && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
                <strong>Modo demo:</strong> no hay credenciales de pago configuradas, así que el pago
                se simula para que pruebes el flujo completo. Conecta Wompi o dLocal Go en las variables de
                entorno para cobros reales.
              </p>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={14} /> {t("checkout.secure")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
