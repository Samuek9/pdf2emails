import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | undefined | null>;

/**
 * Registra un evento del embudo. Acepta cualquier nombre y propiedades.
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  if (typeof window === "undefined") return;

  posthog.capture(eventName, properties);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Event Tracked]: ${eventName}`, properties ?? {});
  }
}
