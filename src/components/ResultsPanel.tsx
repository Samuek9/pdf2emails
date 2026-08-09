"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileText, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { downloadBlob, toCsv, toTxt } from "@/lib/csv";
import { applyFilters } from "@/lib/emails";
import { useLocalPrice } from "@/lib/fx";
import { t } from "@/lib/i18n";
import type { EmailCategory, ExtractOptions, ExtractedEmail, ParsedPdf, Pricing } from "@/lib/types";

const FREE_PAGES = 2;
const FREE_PREVIEW_COUNT = 5;

interface ResultsPanelProps {
  parsed: ParsedPdf;
  unlocked: boolean;
  pricing: Pricing;
  onRequestUnlock: (lockedCount: number) => void;
  onDownloaded: (format: "csv" | "txt") => void;
  onReset: () => void;
}

export function ResultsPanel({
  parsed,
  unlocked,
  pricing,
  onRequestUnlock,
  onDownloaded,
  onReset,
}: ResultsPanelProps) {
  const [options, setOptions] = useState<ExtractOptions>({
    excludeGeneric: true,
    excludePersonal: false,
  });
  const [copied, setCopied] = useState(false);
  const trackedFile = useRef<string | null>(null);

  const result = useMemo(
    () => applyFilters(parsed.all, parsed.totalRaw, options),
    [parsed, options],
  );

  useEffect(() => {
    if (parsed && trackedFile.current !== parsed.fileName) {
      trackedFile.current = parsed.fileName;
      trackEvent("preview_rendered", {
        totalEmailsFound: result.totalEmails,
        numPages: parsed.numPages,
      });
    }
  }, [parsed, result.totalEmails]);

  const effectivelyUnlocked = unlocked || parsed.numPages <= FREE_PAGES;
  const visibleEmails = result.emails.slice(0, FREE_PREVIEW_COUNT);
  const lockedEmails = result.emails.slice(FREE_PREVIEW_COUNT);
  const lockedCount = result.totalEmails - visibleEmails.length;
  const showPaywall = !effectivelyUnlocked && lockedCount > 0;
  const canDownload = effectivelyUnlocked || lockedCount === 0;

  async function handleCopySamples() {
    const samples = visibleEmails.map((e) => e.email).join("\n");
    try {
      await navigator.clipboard.writeText(samples);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent("samples_copied", { count: visibleEmails.length });
    } catch {
      // clipboard no disponible; se ignora.
    }
  }

  function handleDownload(format: "csv" | "txt") {
    const emails = result.emails.map((e) => e.email);
    const base = parsed.fileName.replace(/\.pdf$/i, "") || "emails";
    if (format === "csv") {
      downloadBlob(`${base}-correos.csv`, toCsv(emails), "text/csv;charset=utf-8");
    } else {
      downloadBlob(`${base}-correos.txt`, toTxt(emails), "text/plain;charset=utf-8");
    }
    trackEvent("csv_downloaded", { format, totalEmails: emails.length });
    onDownloaded(format);
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{parsed.fileName}</p>
            <p className="text-xs text-slate-400">
              {t("result.filePages", { pages: parsed.numPages, emails: result.totalEmails })}
            </p>
          </div>
        </div>
        <button onClick={onReset} className="btn-secondary !py-2 text-xs">
          <RefreshCw size={14} /> {t("result.reset")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-4">
        <MetricCard label={t("result.metricFound")} value={result.totalEmails} highlight />
        <MetricCard label={t("result.metricCorporate")} value={result.corporateCount} />
        <MetricCard
          label={t("result.metricGeneric")}
          value={result.genericCount + result.excludedGeneric}
          sub={options.excludeGeneric ? t("result.excludedFilter") : undefined}
        />
        <MetricCard
          label={t("result.metricPersonal")}
          value={result.personalCount + result.excludedPersonal}
          sub={options.excludePersonal ? t("result.excludedFilter") : undefined}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label={t("result.filterGeneric")}
            checked={options.excludeGeneric}
            onChange={(v) => setOptions((o) => ({ ...o, excludeGeneric: v }))}
          />
          <FilterChip
            label={t("result.filterPersonal")}
            checked={options.excludePersonal}
            onChange={(v) => setOptions((o) => ({ ...o, excludePersonal: v }))}
          />
        </div>
        {visibleEmails.length > 0 && (
          <button onClick={() => void handleCopySamples()} className="btn-secondary !py-2 text-xs">
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? t("result.copied") : t("result.copySamples")}
          </button>
        )}
      </div>

      <div className="relative border-t border-slate-100">
        {result.totalEmails === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">{t("result.emptyTitle")}</p>
            <p className="mt-1 text-xs text-slate-400">
              {t("result.emptySub")}
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">{t("result.thEmail")}</th>
                <th className="px-5 py-3">{t("result.thType")}</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmails.map((entry, i) => (
                <EmailRow key={entry.email} entry={entry} index={i + 1} />
              ))}
              {showPaywall &&
                lockedEmails.map((entry, i) => (
                  <EmailRow key={entry.email} entry={entry} index={visibleEmails.length + i + 1} blurred />
                ))}
              {unlocked &&
                lockedEmails.map((entry, i) => (
                  <EmailRow key={entry.email} entry={entry} index={visibleEmails.length + i + 1} />
                ))}
            </tbody>
          </table>
        )}

        {showPaywall && (
          <PaywallOverlay
            pricing={pricing}
            lockedCount={lockedCount}
            onUnlock={() => onRequestUnlock(lockedCount)}
            pages={parsed.numPages}
            emails={result.totalEmails}
          />
        )}
      </div>

      {canDownload && result.totalEmails > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-emerald-50/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {unlocked ? t("result.unlocked") : t("result.allFree")}
            </p>
            <p className="text-xs text-slate-500">{t("result.ready", { n: result.totalEmails })}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => handleDownload("csv")}>
              <Download size={16} /> {t("result.downloadCsv")}
            </button>
            <button className="btn-secondary" onClick={() => handleDownload("txt")}>
              <FileText size={16} /> {t("result.downloadTxt")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight ? "border-emerald-200 bg-emerald-50/70" : "border-slate-100 bg-slate-50/60"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

function FilterChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-slate-800">
      <input
        type="checkbox"
        className="h-3.5 w-3.5 accent-emerald-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

const CATEGORY_STYLES: Record<EmailCategory, string> = {
  corporate: "border-emerald-200 bg-emerald-50 text-emerald-700",
  generic: "border-amber-200 bg-amber-50 text-amber-700",
  personal: "border-sky-200 bg-sky-50 text-sky-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-600",
};

const CATEGORY_KEYS: Record<EmailCategory, string> = {
  corporate: "result.catCorporate",
  generic: "result.catGeneric",
  personal: "result.catPersonal",
  unknown: "result.catOther",
};

function EmailRow({
  entry,
  index,
  blurred,
}: {
  entry: ExtractedEmail;
  index: number;
  blurred?: boolean;
}) {
  return (
    <tr className={`border-b border-slate-50 last:border-0 ${blurred ? "opacity-70" : ""}`}>
      <td className="px-5 py-2.5 text-xs text-slate-400">{index}</td>
      <td
        className={`px-5 py-2.5 font-mono text-sm text-slate-700 ${
          blurred ? "blur-sm select-none" : ""
        }`}
      >
        {entry.email}
      </td>
      <td className="px-5 py-2.5">
        <span className={`chip ${CATEGORY_STYLES[entry.category]}`}>
          {t(CATEGORY_KEYS[entry.category])}
        </span>
      </td>
    </tr>
  );
}

function PaywallOverlay({
  pricing,
  lockedCount,
  onUnlock,
  pages,
  emails,
}: {
  pricing: Pricing;
  lockedCount: number;
  onUnlock: () => void;
  pages: number;
  emails: number;
}) {
  const local = useLocalPrice(pricing.countryCode);
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-white via-white/60 to-transparent px-4 pb-6 pt-20">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Lock size={22} className="text-emerald-700" />
        </div>
        <h4 className="mt-3 text-lg font-extrabold text-slate-900">
          {lockedCount === 1 ? t("result.lockedOne", { n: lockedCount }) : t("result.lockedMany", { n: lockedCount })}
        </h4>
        <p className="mt-1 text-sm text-slate-500">
          {t("result.valueMsg", { pages, emails, price: `$${pricing.priceUsd.toFixed(2)}` })}
        </p>
        <div className="mt-4">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">
            {`$${pricing.priceUsd.toFixed(2)}`}
          </span>
          <span className="ml-1 text-sm font-semibold text-slate-500">USD</span>
          {pricing.region === "latam" && (
            <p className="mt-1 text-xs font-bold text-emerald-600">
              {local && t("result.latamPrice", { amount: local.amount, currency: local.currency })}
            </p>
          )}
        </div>
        <button onClick={onUnlock} className="btn-primary mt-5 w-full">
          {t("result.unlockBtn")}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} /> {t("result.securePay")}
        </p>
      </div>
    </div>
  );
}
