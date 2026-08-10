"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PendingPayment =
  | { gateway: "wompi"; reference: string; option: string; country: string }
  | { gateway: "dlocal"; orderId: string; dlocalPaymentId: string; option: string; country: string };

const PENDING_PAYMENT_KEY = "pdf2emails_pending_payment";

export default function ThankYouPage() {
  const [status, setStatus] = useState<"idle" | "verifying" | "ok" | "error">("idle");

  // Al volver de un flujo de pago con redireccion completa (dLocal, o Wompi
  // via metodos como PSE), se confirma el pago de verdad contra la API real
  // ANTES de desbloquear nada. "?paid=1" en la URL nunca es suficiente por si
  // solo — sin un registro pendiente + verificacion, no se toca localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;

    let pending: PendingPayment | null = null;
    try {
      const raw = window.localStorage.getItem(PENDING_PAYMENT_KEY);
      pending = raw ? (JSON.parse(raw) as PendingPayment) : null;
    } catch {
      pending = null;
    }

    if (!pending) {
      // No hay registro de una compra iniciada desde este navegador: no se
      // desbloquea nada por una URL sola.
      setStatus("error");
      return;
    }

    setStatus("verifying");

    const wompiId = pending.gateway === "wompi" ? params.get("id") || params.get("transaction-id") : null;

    const verifyReq =
      pending.gateway === "dlocal"
        ? fetch("/api/dlocal/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: pending.dlocalPaymentId,
              orderId: pending.orderId,
              option: pending.option,
              country: pending.country,
            }),
          })
        : wompiId
          ? fetch("/api/wompi/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transactionId: wompiId,
                reference: pending.reference,
                option: pending.option,
                country: pending.country,
              }),
            })
          : Promise.reject(new Error("missing wompi transaction id"));

    verifyReq
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`verify ${r.status}`))))
      .then((d: { ok?: boolean; token?: string }) => {
        if (!d.ok || !d.token) throw new Error("payment not verified");
        window.localStorage.setItem("pdf2emails_unlocked", "1");
        window.localStorage.setItem("pdf2emails_payment_token", d.token);
        window.localStorage.removeItem(PENDING_PAYMENT_KEY);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));

    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (status !== "ok") return;
    // Dispara el evento de conversión de Google Ads (AW-18380745476), solo
    // despues de confirmar el pago real.
    try {
      const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
      if (typeof gtag === "function") {
        gtag("event", "conversion", { send_to: "AW-18380745476/XXXXXXXXXXXXXXX" });
      }
    } catch {
      // gtag no disponible
    }
  }, [status]);

  if (status === "verifying") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-slate-500">Confirming your payment…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">We couldn&apos;t confirm this payment</h1>
        <p className="mt-3 text-slate-600">
          If you completed a payment and this keeps happening, contact support and we&apos;ll sort it out.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
        >
          Back home →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
        Payment successful
      </h1>
      <p className="mt-3 text-slate-600">
        Your list is unlocked. Head back to continue, copy, or export your emails.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
      >
        Back to your results →
      </Link>
    </div>
  );
}
