"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ThankYouPage() {
  // Al volver de dLocal (?paid=1), marca el desbloqueo para que la home
  // (que lo lee de localStorage) lo aplique. Se hace tras montar para no
  // romper el hydration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      window.localStorage.setItem("pdf2emails_unlocked", "1");
    }
  }, []);

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

