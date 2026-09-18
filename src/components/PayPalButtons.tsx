"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import type { CheckoutOption } from "@/lib/orders";

/**
 * Botones embebidos del SDK JS de PayPal.
 *
 * Por que existe esto: en el flujo de redireccion (link `checkoutnow`) PayPal
 * arranca en su pantalla de login y esta cuenta no tiene pago como invitado, asi
 * que el comprador sin cuenta PayPal se cae. El SDK, en cambio, puede dibujar un
 * boton propio de "Tarjeta de debito o credito" (funding source `card`) que abre
 * el formulario de tarjeta SIN pedir login. Requiere que la cuenta tenga
 * habilitadas las tarjetas (PayPal -> Enlaces y botones de pago -> Elegir formas
 * de pago -> "Tarjetas de credito y debito estandar"); el SDK confirma la
 * elegibilidad por pais/dispositivo antes de dibujarlo.
 */

interface PayPalButtonInstance {
  isEligible?: () => boolean;
  render: (target: HTMLElement) => Promise<void>;
}

interface PayPalButtonsConfig {
  style?: { layout?: string; shape?: string; label?: string; height?: number };
  fundingSource?: string;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

interface PayPalSdk {
  Buttons: (config: PayPalButtonsConfig) => PayPalButtonInstance;
  FUNDING: { PAYPAL: string; CARD: string };
}

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

let sdkPromise: Promise<void> | null = null;

/** Carga el SDK una sola vez. El client-id de PayPal es publico por diseno. */
function loadSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}` +
        "&currency=USD&intent=capture&components=buttons,funding-eligibility" +
        "&enable-funding=card&disable-funding=credit";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal"));
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

interface PayPalButtonsProps {
  reference: string;
  option: CheckoutOption;
  country: string;
  coupon?: string | null;
  onApproved: (token: string) => void;
  onFailed: (message: string) => void;
}

export function PayPalButtons({
  reference,
  option,
  country,
  coupon,
  onApproved,
  onFailed,
}: PayPalButtonsProps) {
  const paypalHost = useRef<HTMLDivElement>(null);
  const cardHost = useRef<HTMLDivElement>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Los callbacks van en refs para que el efecto de montaje no se repita en cada
  // render (volveria a dibujar los botones una y otra vez).
  const approvedRef = useRef(onApproved);
  const failedRef = useRef(onFailed);
  approvedRef.current = onApproved;
  failedRef.current = onFailed;

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId || !reference) return;
    let mounted = true;

    // El monto y la referencia los calcula/valida el servidor: aqui solo se pide
    // la orden y se devuelve su id, que es lo que el SDK necesita.
    const createOrder = async (): Promise<string> => {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, option, country, coupon }),
      });
      const data = (await res.json().catch(() => null)) as { id?: string } | null;
      if (!res.ok || !data?.id) throw new Error(`create-order ${res.status}`);
      return data.id;
    };

    // onApprove SOLO dice que el SDK cree que se aprobo: se confirma/captura
    // contra la API real (monto + referencia) antes de desbloquear nada.
    const capture = async (orderId: string): Promise<void> => {
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, reference, option, country, coupon }),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; token?: string } | null;
        if (!res.ok || !data?.ok || !data.token) throw new Error("capture failed");
        approvedRef.current(data.token);
      } catch {
        failedRef.current(t("checkout.errPaypal"));
      }
    };

    loadSdk(clientId)
      .then(() => {
        if (!mounted || !window.paypal) return;
        const sdk = window.paypal;
        const style = { layout: "vertical", shape: "pill", label: "pay", height: 40 };

        if (paypalHost.current) {
          sdk
            .Buttons({
              style,
              fundingSource: sdk.FUNDING.PAYPAL,
              createOrder,
              onApprove: (data) => capture(data.orderID),
              onCancel: () => failedRef.current(t("checkout.errPaypal")),
              onError: () => failedRef.current(t("checkout.errPaypal")),
            })
            .render(paypalHost.current);
        }

        // Este es el boton que quita el login: abre el formulario de tarjeta
        // directo. Solo se dibuja si PayPal lo considera elegible para esta
        // cuenta / pais / dispositivo (si no, queda solo el boton de PayPal).
        const cardButton = sdk.Buttons({
          style,
          fundingSource: sdk.FUNDING.CARD,
          createOrder,
          onApprove: (data) => capture(data.orderID),
          onCancel: () => failedRef.current(t("checkout.errPaypal")),
          onError: () => failedRef.current(t("checkout.errPaypal")),
        });
        if ((!cardButton.isEligible || cardButton.isEligible()) && cardHost.current) {
          cardButton
            .render(cardHost.current)
            .then(() => {
              if (mounted) setCardVisible(true);
            })
            .catch(() => {
              /* no elegible: se queda solo el boton de PayPal */
            });
        }
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      mounted = false;
    };
  }, [reference, option, country, coupon]);

  return (
    <div className="mt-5">
      <div ref={paypalHost} />
      <div ref={cardHost} className={cardVisible ? "mt-3" : "hidden"} />
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {t("checkout.errPaypalStart")}
        </p>
      )}
    </div>
  );
}
