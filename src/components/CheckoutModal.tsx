"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Landmark, Loader2, Lock, ShieldCheck, Wallet, X } from "lucide-react";
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
  coupon?: string | null;
}

type Step = "method" | "processing" | "success";

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
  coupon,
}: CheckoutModalProps) {
  const pricing = useMemo(() => getPricing(country), [country]);
  const local = useLocalPrice(country, amount);
  const [step, setStep] = useState<Step>("method");
  const [error, setError] = useState<string | null>(null);
  const [paidGateway, setPaidGateway] = useState<Gateway | "demo">("demo");
  const paidTokenRef = useRef<string>("");
  const referenceRef = useRef<string>("");
  const viewedTrackedRef = useRef(false);

  // Que pasarelas tienen llaves configuradas en el servidor. Se arranca en
  // "no cargado" y se espera la respuesta antes de decidir el flujo / mostrar
  // el aviso de modo demo, para no parpadear con informacion falsa.
  const [liveConfig, setLiveConfig] = useState<{ paypal: boolean; dlocal: boolean; loaded: boolean }>({
    paypal: false,
    dlocal: false,
    loaded: false,
  });

  // Pasarela con la que se va a cobrar de verdad: la preferida del pais
  // (dLocal Go en LATAM, PayPal en el resto) si tiene llaves; si no, la otra que
  // este viva. Sin ninguna, se queda la preferida y el pago corre en demo.
  const defaultGateway: Gateway =
    liveConfig.paypal || liveConfig.dlocal
      ? liveConfig[pricing.primaryGateway]
        ? pricing.primaryGateway
        : liveConfig.paypal
          ? "paypal"
          : "dlocal"
      : pricing.primaryGateway;

  // Eleccion manual del comprador. Aparece solo cuando las dos pasarelas estan
  // vivas: asi un colombiano que quiera pagar con su saldo PayPal tambien puede,
  // y quien no tenga cuenta PayPal se queda en el riel local.
  const [gatewayOverride, setGatewayOverride] = useState<Gateway | null>(null);
  const effectiveGateway: Gateway =
    gatewayOverride && liveConfig[gatewayOverride] ? gatewayOverride : defaultGateway;
  const alternativeGateway: Gateway | null =
    liveConfig.paypal && liveConfig.dlocal
      ? effectiveGateway === "paypal"
        ? "dlocal"
        : "paypal"
      : null;

  // Etiqueta de metodo de pago amigable (sin jargon de pasarela): PayPal, o
  // los metodos locales reales del pais cuando cobra dLocal Go.
  const gwMeta =
    effectiveGateway === "paypal"
      ? {
          name: t("checkout.paypalName"),
          subtitle: t("checkout.paypalSub"),
          icon: "wallet" as const,
        }
      : {
          name: t("checkout.payLocalName"),
          subtitle: getLocalPaymentMethods(country).join(" · ") || t("checkout.payLocalSub"),
          icon: "bank" as const,
        };

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

  useEffect(() => {
    if (open) {
      setStep("method");
      setError(null);
      setGatewayOverride(null);
      referenceRef.current = `pdf2emails-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }, [open, pricing.primaryGateway]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/payments/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg: { paypal?: boolean; dlocal?: boolean } | null) => {
        if (!cancelled && cfg) {
          setLiveConfig({ paypal: !!cfg.paypal, dlocal: !!cfg.dlocal, loaded: true });
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

  // El aviso de modo demo solo aparece cuando el servidor ya dijo que no hay
  // ninguna pasarela con llaves (antes de eso no se sabe todavia).
  const demoMode = liveConfig.loaded && !(liveConfig.paypal || liveConfig.dlocal);

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

  async function handlePay() {
    setError(null);
    trackEvent("checkout_clicked", {
      gateway: effectiveGateway,
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

    if (effectiveGateway === "paypal" && liveConfig.paypal) {
      setStep("processing");
      try {
        // El monto lo calcula el servidor a partir del pais+opcion — nunca lo
        // mandamos nosotros, para que no se pueda pagar un monto distinto al
        // real manipulando la llamada.
        const res = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: referenceRef.current, option, country, coupon }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          throw new Error(`PayPal create-order (${res.status}): ${errBody.slice(0, 160)}`);
        }
        const intent = (await res.json()) as { id: string; approveUrl: string };
        // Deja rastro de a que compra pertenece esta orden: es lo que permite
        // capturarla y confirmar el pago al volver de PayPal (ver /thank-you).
        try {
          window.localStorage.setItem(
            PENDING_PAYMENT_KEY,
            JSON.stringify({
              gateway: "paypal",
              orderId: intent.id,
              reference: referenceRef.current,
              option,
              country,
              coupon,
            }),
          );
        } catch { /* noop */ }
        // PayPal aloja el checkout (tarjeta, saldo PayPal o cuenta bancaria):
        // aqui se sale del sitio y se vuelve a /thank-you?paid=1&token=<orderId>.
        window.location.href = intent.approveUrl;
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        setStep("method");
        setError(`${t("checkout.errPaypalStart")} — ${detail}`);
      }
      return;
    }

    // Flujo real con dLocal Go (payment link / redirect).
    if (effectiveGateway === "dlocal" && liveConfig.dlocal) {
      setStep("processing");
      try {
        const res = await fetch("/api/dlocal/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: referenceRef.current, option, country: pricing.countryCode, coupon }),
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
              coupon,
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
        body: JSON.stringify({ option, country, coupon }),
      });
      const d = (await res.json().catch(() => null)) as { ok?: boolean; token?: string } | null;
      if (!res.ok || !d?.ok || !d.token) throw new Error("demo token failed");
      await new Promise((r) => setTimeout(r, 500));
      handleSuccess("demo", d.token);
    } catch {
      setStep("method");
      setError(t("checkout.errPaypal"));
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
                {gwMeta.icon === "wallet" ? <Wallet size={18} /> : <Landmark size={18} />}
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

            {alternativeGateway && step === "method" && (
              <button
                type="button"
                onClick={() => setGatewayOverride(alternativeGateway)}
                className="mt-3 w-full text-center text-xs font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 transition hover:text-emerald-800"
              >
                {alternativeGateway === "paypal"
                  ? t("checkout.switchPaypal")
                  : t("checkout.switchLocal", {
                      methods: getLocalPaymentMethods(country).slice(0, 3).join(" · "),
                    })}
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
