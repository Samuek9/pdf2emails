"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Rating = "GOOD" | "NEUTRAL" | "BAD";

const OPTIONS: { rating: Rating; emoji: string; label: string }[] = [
  { rating: "GOOD", emoji: "👍", label: "Sí, perfecto" },
  { rating: "NEUTRAL", emoji: "😐", label: "Faltaron algunos" },
  { rating: "BAD", emoji: "👎", label: "Tuve un problema" },
];

export function FeedbackWidget() {
  const [submitted, setSubmitted] = useState<Rating | null>(null);

  const handleFeedback = (rating: Rating) => {
    trackEvent("user_feedback_submitted", { rating });
    setSubmitted(rating);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
        ¡Gracias por tu respuesta! Nos ayuda a mejorar la herramienta. 🙌
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="mb-3 text-sm font-medium text-slate-700">
        ¿El archivo CSV extrajo correctamente los correos que necesitabas?
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            onClick={() => handleFeedback(opt.rating)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm transition hover:bg-slate-100"
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
