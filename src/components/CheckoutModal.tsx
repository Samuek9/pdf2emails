"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, CreditCard, Landmark, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { getPricing } from "@/lib/pricing";
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
  const [step, setStep] = useState<Step>("method");
  const [gateway, setGateway] = useState<Gateway>(pricing.primaryGateway);
  const [error, setError] = useState<string | null>(null);
  const [paidGateway, setPaidGateway] = useState<Gateway | "demo">("demo");
  const referenceRef = useRef<string>("");

  const wompiLiveConfigured = Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);

  useEffect(() => {
    if (open) {
      setStep("method");
      setGateway(pricing.primaryGateway);
      setError(null);
      referenceRef.current = `pdf2emails-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }, [open, pricing.primaryGateway]);

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

    if (gateway === "wompi" && wompiLiveConfigured) {
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
            setError("El pago no fue aprobado o fue cancelado. Intenta de nuevo.");
          }
        });
      } catch {
        setStep("method");
        setError("No se pudo iniciar el pago con Wompi. Usa el modo demo para probar el flujo.");
      }
      return;
    }

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
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">¡Pago aprobado!</h3>
            <p className="mt-2 text-sm text-slate-500">
              Los {lockedCount} correos están desbloqueados. Descarga tu CSV o TXT ahora.
            </p>
            <button className="btn-primary mt-6 w-full" onClick={() => onSuccess(paidGateway)}>
              Ver correos y descargar <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-900">Desbloquear {lockedCount} correos</h3>
            <p className="mt-1 text-sm text-slate-500">Lista completa + exportación CSV/TXT.</p>

            <div className="mt-5 flex items-end justify-between rounded-xl bg-slate-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Total a pagar
                </p>
                <p className="mt-1 text-3xl font-extrabold">
                  {pricing.region === "latam" ? "$7.99" : "$19"}
                  <span className="text-base font-semibold text-slate-300"> USD</span>
                </p>
              </div>
              {pricing.region === "latam" && (
                <div className="text-right">
                  <p className="text-xs font-medium text-emerald-400">Precio LATAM (PPP)</p>
                  <p className="text-sm font-bold">≈ $32,000 COP</p>
                </div>
              )}
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Método de pago
            </p>
            <div className="mt-2 grid gap-2">
              {([pricing.primaryGateway, pricing.secondaryGateway] as Gateway[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGateway(g)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    gateway === g
                      ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-emerald-700">
                    {GATEWAY_META[g].icon === "card" ? <CreditCard size={18} /> : <Landmark size={18} />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      {GATEWAY_META[g].name}
                    </span>
                    <span className="block text-xs text-slate-500">{GATEWAY_META[g].subtitle}</span>
                  </span>
                  {gateway === g && <Check size={18} className="ml-auto text-emerald-600" />}
                </button>
              ))}
            </div>

            {step === "processing" ? (
              <div className="btn-primary mt-5 w-full cursor-not-allowed opacity-70">
                <Loader2 size={18} className="animate-spin" /> Procesando pago…
              </div>
            ) : (
              <button className="btn-primary mt-5 w-full" onClick={() => void handlePay()}>
                <Lock size={16} /> Pagar {pricing.region === "latam" ? "$7.99 USD" : "$19 USD"}
              </button>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            {!wompiLiveConfigured && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
                <strong>Modo demo:</strong> no hay credenciales de pago configuradas, así que el pago
                se simula para que pruebes el flujo completo. Conecta Wompi/dLocal en las variables de
                entorno para cobros reales.
              </p>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={14} /> Pago cifrado · Soporte a factura
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
