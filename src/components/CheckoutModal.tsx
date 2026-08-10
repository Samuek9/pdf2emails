"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, CreditCard, Landmark, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import { getPricing } from "@/lib/pricing";
import { useLocalPrice } from "@/lib/fx";
import { getLocalPaymentMethods } from "@/lib/countries";
import type { CheckoutOption } from "@/lib/orders";
import type { Gateway } from "@/lib/types";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (gateway: Gateway | "demo", token: string) => void;
  country: string;
  option: CheckoutOption;
  lockedCount: number;
  amount: number;
}

type Step = "method" | "processing" | "success";

declare global {
  interface Window {
    WidgetCheckout?: new (config: Record<string, unknown>) => {
      open: (callback: (result: { transaction?: { id: string; status: string } }) => void) => void;
    };
  }
}

const PENDING_PAYMENT_KEY = "pdf2emails_pending_payment";

// Los nombres amigables del metodo de pago se renderizan via gwMeta localizado.

export function CheckoutModal({
  open,
  onClose,
  onSuccess,
  country,
  option,
  lockedCount,
  amount,
}: CheckoutModalProps) {
  const pricing = useMemo(() => getPricing(country), [country]);
  const local = useLocalPrice(country, amount);
  // Etiqueta de metodo de pago amigable (sin jargon de pasarela: Wompi/dLocal).
  // LATAM: muestra los metodos locales reales del pais + dLocal Go.
  const gwMeta =
    pricing.region === "latam"
      ? {
          name: t("checkout.payLocalName"),
          subtitle: getLocalPaymentMethods(country).join(" · ") || t("checkout.payLocalSub"),
          icon: "bank" as const,
        }
      : { name: t("checkout.payCardName"), subtitle: t("checkout.payCardSub"), icon: "card" as const };
  const [step, setStep] = useState<Step>("method");
  const [gateway, setGateway] = useState<Gateway>(pricing.primaryGateway);
  const [error, setError] = useState<string | null>(null);
  const [paidGateway, setPaidGateway] = useState<Gateway | "demo">("demo");
  const paidTokenRef = useRef<string>("");
  const referenceRef = useRef<string>("");
  const viewedTrackedRef = useRef(false);

  useEffect(() => {
    if (open && !viewedTrackedRef.current) {
      viewedTrackedRef.current = true;
      trackEvent("checkout_viewed", {
        gateway: pricing.primaryGateway,
        price: pricing.displayPrice,
        country,
        region: pricing.region,
        lockedCount,
      });
    }
  }, [open, pricing, country, lockedCount]);


  const wompiLiveConfigured = Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);
  const [liveConfig, setLiveConfig] = useState<{ wompi: boolean; dlocal: boolean; loaded: boolean }>({
    wompi: wompiLiveConfigured,
    dlocal: false,
    loaded: false,
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
          setLiveConfig({ wompi: !!cfg.wompi, dlocal: !!cfg.dlocal, loaded: true });
        } else if (!cancelled) {
          setLiveConfig((c) => ({ ...c, loaded: true }));
        }
      })
      .catch(() => {
        if (!cancelled) setLiveConfig((c) => ({ ...c, loaded: true }));
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const demoMode = !(liveConfig.wompi || liveConfig.dlocal);

  if (!open) return null;

  function handleSuccess(gw: Gateway | "demo", token: string) {
    paidTokenRef.current = token;
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

    // Espera a que /api/payments/config termine de cargar antes de decidir el
    // flujo (evita el error "no configurado" por condicion de carrera en el
    // primer clic).
    if (!liveConfig.loaded) {
      await new Promise<void>((resolve) => {
        const t0 = Date.now();
        const check = () => {
          if (liveConfig.loaded || Date.now() - t0 > 3000) return resolve();
          setTimeout(check, 50);
        };
        check();
      });
    }

    if (gateway === "wompi" && liveConfig.wompi) {
      setStep("processing");
      try {
        await loadWompiScript();
        // El monto lo calcula el servidor a partir de pais+opcion — nunca lo
        // mandamos nosotros, para que no se pueda pagar un monto distinto al
        // real manipulando la llamada.
        const intentRes = await fetch("/api/wompi/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: referenceRef.current, option, country }),
        });
        if (!intentRes.ok) {
          const errBody = await intentRes.text().catch(() => "");
          throw new Error(`WOMPI create-intent (${intentRes.status}): ${errBody.slice(0, 160)}`);
        }
        const intent = (await intentRes.json()) as {
          signature: string;
          amountInCents: number;
          currency: string;
        };

        const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error(
            "NEXT_PUBLIC_WOMPI_PUBLIC_KEY no está inyectada en el bundle del cliente. Revisa la variable en Vercel y haz redeploy.",
          );
        }
        if (typeof window.WidgetCheckout !== "function") {
          throw new Error("window.WidgetCheckout no está definido tras cargar checkout.wompi.co/widget.js");
        }

        // Por si Wompi usa un metodo redirect (PSE) en vez del callback en
        // pagina: dejamos rastro de a que compra pertenece esta transaccion
        // para poder verificarla en /thank-you al volver.
        try {
          window.localStorage.setItem(
            PENDING_PAYMENT_KEY,
            JSON.stringify({ gateway: "wompi", reference: referenceRef.current, option, country }),
          );
        } catch { /* noop */ }

        // El backend convierte USD->COP (cuenta de Wompi solo COP). El widget debe
        // cobrar la MISMA moneda y monto que la transaccion creada.
        const widget = new window.WidgetCheckout!({
          currency: intent.currency,
          amountInCents: intent.amountInCents,
          reference: referenceRef.current,
          publicKey,
          // El Widget JS de Wompi espera la firma como OBJETO { integrity }.
          signature: { integrity: intent.signature },
          redirectUrl: `${window.location.origin}/thank-you?paid=1`,
        });
        widget.open((result) => {
          const tx = result.transaction;
          if (!tx || tx.status !== "APPROVED") {
            setStep("method");
            setError(t("checkout.errWompi"));
            return;
          }
          // El callback en pagina SOLO dice que el widget cree que se aprobo.
          // Confirmamos contra la API real de Wompi antes de desbloquear nada.
          void fetch("/api/wompi/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: tx.id, reference: referenceRef.current, option, country }),
          })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`verify ${r.status}`))))
            .then((d: { ok: boolean; token?: string }) => {
              if (!d.ok || !d.token) throw new Error("verify not ok");
              try { window.localStorage.removeItem(PENDING_PAYMENT_KEY); } catch { /* noop */ }
              handleSuccess("wompi", d.token);
            })
            .catch(() => {
              setStep("method");
              setError(t("checkout.errWompi"));
            });
        });
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        setStep("method");
        // Muestra el detalle real del error para poder diagnosticar (útil en
        // desarrollo / pruebas). En producción se conserva el mensaje general.
        setError(`${t("checkout.errWompiStart")} — ${detail}`);
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
          body: JSON.stringify({ orderId: referenceRef.current, option, country: pricing.countryCode }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          let detail = "";
          try { detail = JSON.parse(errBody)?.error || ""; } catch { detail = errBody.slice(0, 120); }
          setStep("method");
          setError(detail ? `${t("checkout.errDlocal")} (${detail})` : t("checkout.errDlocal"));
          return;
        }
        const intent = (await res.json()) as { id: string; redirectUrl: string; orderId: string };
        // dLocal solo redirige de vuelta con "?paid=1" (sin el id del pago), asi
        // que guardamos aqui lo necesario para confirmar el pago real al volver
        // (ver /thank-you). Sin este registro, /thank-you NO desbloquea nada.
        try {
          window.localStorage.setItem(
            PENDING_PAYMENT_KEY,
            JSON.stringify({
              gateway: "dlocal",
              orderId: intent.orderId,
              dlocalPaymentId: intent.id,
              option,
              country: pricing.countryCode,
            }),
          );
        } catch { /* noop */ }
        window.location.href = intent.redirectUrl;
      } catch {
        setStep("method");
        setError(
          t("checkout.errDlocal"),
        );
      }
      return;
    }

    // Modo demo: sin pasarela real configurada, el servidor emite un token de
    // prueba (se autodesactiva en cuanto haya llaves reales — ver la ruta).
    setStep("processing");
    try {
      const res = await fetch("/api/payments/demo-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option, country }),
      });
      const d = (await res.json().catch(() => null)) as { ok?: boolean; token?: string } | null;
      if (!res.ok || !d?.ok || !d.token) throw new Error("demo token failed");
      await new Promise((r) => setTimeout(r, 500));
      handleSuccess(gateway === "wompi" ? "wompi" : "demo", d.token);
    } catch {
      setStep("method");
      setError(t("checkout.errWompi"));
    }
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
            <button className="btn-primary mt-6 w-full" onClick={() => onSuccess(paidGateway, paidTokenRef.current)}>
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
                <p suppressHydrationWarning className="mt-1 text-3xl font-extrabold">
                  {local
                    ? `${local.symbol}${local.amount}`
                    : `$${amount.toFixed(2)}`}
                  <span className="text-base font-semibold text-slate-300">
                    {local ? local.currency : " USD"}
                  </span>
                </p>
              </div>
              {local && (
                <div className="text-right">
                  <p className="text-xs font-medium text-emerald-400">{t("checkout.latamPpp")}</p>
                  <p suppressHydrationWarning className="text-sm font-bold text-emerald-300">
                    ≈ {local.symbol}{local.amount} {local.currency}
                  </p>
                </div>
              )}
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("checkout.payMethod")}
            </p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-500 bg-emerald-50/50 px-4 py-3 ring-1 ring-emerald-500">
              <span className="text-emerald-700">
                {gwMeta.icon === "card" ? <CreditCard size={18} /> : <Landmark size={18} />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {gwMeta.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {gwMeta.subtitle}
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
                <Lock size={16} /> {t("checkout.pay", { price: local ? `${local.symbol}${local.amount}` : `$${amount.toFixed(2)}` })}
              </button>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            {demoMode && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
                {t("checkout.demo")}
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
