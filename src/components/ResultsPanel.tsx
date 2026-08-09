"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileText, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { downloadBlob, downloadXlsx, toCsv, toTxt } from "@/lib/csv";
import { applyFilters } from "@/lib/emails";
import { t } from "@/lib/i18n";
import type { EmailCategory, ExtractOptions, ExtractedEmail, ParsedPdf } from "@/lib/types";

const FREE_PAGES = 3;
const PREVIEW = 10;

type UnlockOption = "full" | "fullverify";

interface ResultsPanelProps {
  parsed: ParsedPdf;
  unlocked: boolean;
  onDownloaded: (format: "csv" | "txt") => void;
  onVerify: () => void;
  onUnlock: (option: UnlockOption) => void;
  onReset: () => void;
  fullPrice: number;
  verifyPrice: number;
}

export function ResultsPanel({ parsed, unlocked, onDownloaded, onVerify, onUnlock, onReset, fullPrice, verifyPrice }: ResultsPanelProps) {
  const [options, setOptions] = useState<ExtractOptions>({ excludeGeneric: true, excludePersonal: false });
  const [copied, setCopied] = useState(false);
  const trackedFile = useRef<string | null>(null);

  const result = useMemo(() => applyFilters(parsed.all, parsed.totalRaw, options), [parsed, options]);

  // Conteos "brutos" (antes de filtros) para que las tarjetas sumen al total
  // encontrado y coincidan con el conteo del checkout (consistencia de numeros).
  const grossCounts = useMemo(() => {
    const counts = { corporate: 0, generic: 0, personal: 0, unknown: 0 };
    for (const e of parsed.all) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }, [parsed]);
  const grossTotal = grossCounts.corporate + grossCounts.generic + grossCounts.personal + grossCounts.unknown;

  useEffect(() => {
    if (parsed && trackedFile.current !== parsed.fileName) {
      trackedFile.current = parsed.fileName;
      trackEvent("preview_rendered", { totalEmailsFound: result.totalEmails, numPages: parsed.numPages });
    }
  }, [parsed, result.totalEmails]);

  const isFree = parsed.numPages <= FREE_PAGES || result.totalEmails <= PREVIEW;
  const effectivelyUnlocked = unlocked || isFree;
  const lockedCount = Math.max(0, result.totalEmails - PREVIEW);
  const showPaywall = !effectivelyUnlocked && lockedCount > 0;

  async function handleCopy() {
    const all = result.emails.map((e) => e.email).join("\n");
    try {
      await navigator.clipboard.writeText(all);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
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

  async function handleExcel() {
    await downloadXlsx(result.emails.map((e) => e.email));
    trackEvent("excel_downloaded", { totalEmails: result.totalEmails });
  }

  const visible = result.emails.slice(0, PREVIEW);
  const rest = result.emails.slice(PREVIEW);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{parsed.fileName}</p>
            <p className="text-xs text-slate-500">
              {t("result.filePages", { pages: parsed.numPages, emails: result.totalEmails })}
              {isFree && <span className="ml-2 font-semibold text-emerald-600">{t("result.freeBadge")}</span>}
            </p>
          </div>
        </div>
        <button onClick={onReset} className="btn-secondary !py-2 text-xs">
          <RefreshCw size={14} /> {t("result.reset")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-4">
        <MetricCard label={t("result.metricFound")} value={grossTotal} highlight />
        <MetricCard label={t("result.metricCorporate")} value={grossCounts.corporate} />
        <MetricCard label={t("result.metricGeneric")} value={grossCounts.generic} sub={options.excludeGeneric ? t("result.excludedFilter") : undefined} />
        <MetricCard label={t("result.metricPersonal")} value={grossCounts.personal} sub={options.excludePersonal ? t("result.excludedFilter") : undefined} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip label={t("result.filterGeneric")} checked={options.excludeGeneric} onChange={(v) => setOptions((o) => ({ ...o, excludeGeneric: v }))} />
          <FilterChip label={t("result.filterPersonal")} checked={options.excludePersonal} onChange={(v) => setOptions((o) => ({ ...o, excludePersonal: v }))} />
        </div>
        {effectivelyUnlocked && result.totalEmails > 0 && (
          <button onClick={() => void handleCopy()} className="btn-secondary !py-2 text-xs">
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? t("result.copied") : t("result.copyAll")}
          </button>
        )}
      </div>

      <div className="relative border-t border-slate-100">
        {result.totalEmails === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">{t("result.emptyTitle")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("result.emptySub")}</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">{t("result.thIndex")}</th>
                <th className="px-5 py-3">{t("result.thEmail")}</th>
                <th className="px-5 py-3">{t("result.thType")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry, i) => (
                <EmailRow key={entry.email} entry={entry} index={i + 1} />
              ))}
              {showPaywall &&
                rest.map((entry, i) => (
                  <EmailRow key={entry.email} entry={entry} index={visible.length + i + 1} blurred />
                ))}
              {effectivelyUnlocked &&
                rest.map((entry, i) => (
                  <EmailRow key={entry.email} entry={entry} index={visible.length + i + 1} />
                ))}
            </tbody>
          </table>
        )}

        {showPaywall && (
          <PaywallOverlay pages={parsed.numPages} lockedCount={lockedCount} fullPrice={fullPrice} verifyPrice={verifyPrice} onFull={() => onUnlock("full")} onVerify={() => onUnlock("fullverify")} />
        )}
      </div>

      {effectivelyUnlocked && result.totalEmails > 0 && (
        <div className="border-t border-slate-100 bg-emerald-50/40 px-5 py-5">
          <p className="text-sm font-bold text-slate-800">{t("result.unlocked")}</p>
          <SecurityPreview emails={result.emails} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button className="btn-secondary" onClick={() => void handleDownload("csv")}>
              <Download size={16} /> {t("sec.rawBtn")}
            </button>
            <button className="btn-primary !px-6 !py-3" onClick={onVerify}>
              <ShieldCheck size={16} /> {t("result.verifyBtn")}
            </button>
            <button className="btn-secondary" onClick={() => void handleExcel()}>
              <FileText size={16} /> Excel
            </button>
          </div>
          <p className="mt-2 text-xs font-medium text-red-600">{t("sec.rawWarning")}</p>
        </div>
      )}
    </div>
  );
}

function PaywallOverlay({
  pages,
  lockedCount,
  fullPrice,
  verifyPrice,
  onFull,
  onVerify,
}: {
  pages: number;
  lockedCount: number;
  fullPrice: number;
  verifyPrice: number;
  onFull: () => void;
  onVerify: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-white via-white/60 to-transparent px-4 pb-6 pt-20">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Lock size={22} className="text-emerald-700" />
        </div>
        <h4 className="mt-3 text-lg font-extrabold text-slate-900">{t("result.paywallTitle", { n: lockedCount })}</h4>
        <p className="mt-1 text-sm text-slate-500">{t("result.paywallSub", { pages })}</p>
        <div className="mt-4 space-y-2">
          <button onClick={onFull} className="btn-secondary w-full">
            {t("result.optionFull", { price: fullPrice.toFixed(2) })}
          </button>
          <button onClick={onVerify} className="btn-primary w-full">
            <ShieldCheck size={16} /> {t("result.optionVerify", { price: verifyPrice.toFixed(2) })}
          </button>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck size={14} /> {t("result.securePay")}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? "border-emerald-200 bg-emerald-50/70" : "border-slate-100 bg-slate-50/60"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

function FilterChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-slate-800">
      <input type="checkbox" className="h-3.5 w-3.5 accent-emerald-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

const CATEGORY_KEYS: Record<EmailCategory, string> = {
  corporate: "result.catCorporate",
  generic: "result.catGeneric",
  personal: "result.catPersonal",
  unknown: "result.catOther",
};

function EmailRow({ entry, index, blurred }: { entry: ExtractedEmail; index: number; blurred?: boolean }) {
  return (
    <tr className={`border-b border-slate-50 last:border-0 ${blurred ? "opacity-70" : ""}`}>
      <td className="px-5 py-2.5 text-xs text-slate-500">{index}</td>
      <td className={`px-5 py-2.5 font-mono text-sm text-slate-700 ${blurred ? "blur-sm select-none" : ""}`}>{entry.email}</td>
      <td className="px-5 py-2.5">
        <span className="chip border-slate-200 bg-slate-50 text-slate-600">{t(CATEGORY_KEYS[entry.category])}</span>
      </td>
    </tr>
  );
}

function SecurityPreview({ emails }: { emails: ExtractedEmail[] }) {
  const sample = emails.slice(0, 6);
  const statuses = ["valid", "valid", "dangerCatch", "dangerSpam", "dangerOcr", "dangerCatch"];
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2">{t("sec.colEmail")}</th>
            <th className="px-3 py-2">{t("sec.colOrigin")}</th>
            <th className="px-3 py-2">{t("sec.colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {sample.map((entry, i) => {
            const st = statuses[i % statuses.length];
            const green = st === "valid";
            return (
              <tr key={entry.email} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-1.5 font-mono text-slate-700">{entry.email}</td>
                <td className="px-3 py-1.5 text-slate-500">#{i + 1}</td>
                <td className="px-3 py-1.5 font-medium">
                  {green ? <span className="text-emerald-600">🟢 {t("sec.valid")}</span> : <span className="text-red-600">🔴 {t(`sec.${st}`)}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}