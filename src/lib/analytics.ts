type EventProperties = Record<string, string | number | boolean | undefined | null>;

interface PosthogLike {
  capture: (event: string, properties?: EventProperties) => void;
  init: (...args: unknown[]) => void;
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let posthogClient: PosthogLike | null = null;

/**
 * Inicializa PostHog de forma perezosa (solo si hay key configurada).
 * Sin key, los eventos se loguean por consola en desarrollo.
 */
export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined" || !POSTHOG_KEY || posthogClient) return;
  try {
    const posthog = (await import("posthog-js")).default as PosthogLike;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      autocapture: false,
      // Session replay: permite ver literalmente qué hace cada usuario.
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: { password: true, email: true },
      },
      // Captura país/región y dispositivo automáticamente en cada evento.
      ip: true,
      opt_out_capturing_by_default: false,
    });
    posthogClient = posthog;
  } catch (error) {
    console.warn("PostHog init failed", error);
  }
}

/**
 * Registra un evento del embudo. Acepta cualquier nombre y propiedades.
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  if (typeof window === "undefined") return;

  if (posthogClient) {
    try {
      posthogClient.capture(eventName, properties);
    } catch (error) {
      console.warn("PostHog capture failed", error);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Event Tracked]: ${eventName}`, properties ?? {});
  }
}
