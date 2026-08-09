"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";

type Rating = "GOOD" | "NEUTRAL" | "BAD";

const OPTIONS: { rating: Rating; emoji: string; key: string }[] = [
  { rating: "GOOD", emoji: "👍", key: "feedback.good" },
  { rating: "NEUTRAL", emoji: "😐", key: "feedback.neutral" },
  { rating: "BAD", emoji: "👎", key: "feedback.bad" },
];

export function FeedbackWidget() {
  const [submitted, setSubmitted] = useState<Rating | null>(null);

  const handleFeedback = (rating: Rating) => {
    trackEvent("feedback_submitted", { rating });
    setSubmitted(rating);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
        {t("feedback.thanks")}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="mb-3 text-sm font-medium text-slate-700">{t("feedback.q")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            onClick={() => handleFeedback(opt.rating)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm transition hover:bg-slate-100"
          >
            {opt.emoji} {t(opt.key)}
          </button>
        ))}
      </div>
    </div>
  );
}