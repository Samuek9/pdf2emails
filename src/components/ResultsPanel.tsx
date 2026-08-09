"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { downloadBlob, toCsv, toTxt } from "@/lib/csv";
import { applyFilters } from "@/lib/emails";
import { t } from "@/lib/i18n";
import type { EmailCategory, ExtractOptions, ExtractedEmail, ParsedPdf } from "@/lib/types";

interface ResultsPanelProps {
  parsed: ParsedPdf;
  onDownloaded: (format: "csv" | "txt") => void;
  onVerify: () => void;
  onReset: () => void;
}

export function ResultsPanel({ parsed, onDownloaded, onVerify, onReset }: ResultsPanelProps) {
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

  async function handleCopy() {
    const all = result.emails.map((e) => e.email).join("\n");
    try {
      await navigator.clipboard.writeText(all);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent("list_copied", { count: result.totalEmails });
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
        {result.totalEmails > 0 && (
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
            <p className="mt-1 text-xs text-slate-400">{t("result.emptySub")}</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">{t("result.thIndex")}</th>
                <th className="px-5 py-3">{t("result.thEmail")}</th>
                <th className="px-5 py-3">{t("result.thType")}</th>
              </tr>
            </thead>
            <tbody>
              {result.emails.map((entry, i) => (
                <EmailRow key={entry.email} entry={entry} index={i + 1} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {result.totalEmails > 0 && (
        <div className="border-t border-slate-100 bg-emerald-50/40 px-5 py-5">
          <p className="text-sm font-bold text-slate-800">{t("sec.title")}</p>
          <SecurityPreview emails={result.emails} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button className="btn-secondary" onClick={() => handleDownload("csv")}>
              <Download size={16} /> {t("sec.rawBtn")}
            </button>
            <button className="btn-primary !px-6 !py-3" onClick={onVerify}>
              <ShieldCheck size={16} /> {t("sec.verifyBtn")}
            </button>
          </div>
          <p className="mt-2 text-xs font-medium text-red-600">{t("sec.rawWarning")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("sec.verifySub")}</p>
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

const CATEGORY_KEYS: Record<EmailCategory, string> = {
  corporate: "result.catCorporate",
  generic: "result.catGeneric",
  personal: "result.catPersonal",
  unknown: "result.catOther",
};

function EmailRow({ entry, index }: { entry: ExtractedEmail; index: number }) {
  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="px-5 py-2.5 text-xs text-slate-400">{index}</td>
      <td className="px-5 py-2.5 font-mono text-sm text-slate-700">{entry.email}</td>
      <td className="px-5 py-2.5">
        <span className="chip border-slate-200 bg-slate-50 text-slate-600">
          {t(CATEGORY_KEYS[entry.category])}
        </span>
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
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
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
                <td className="px-3 py-1.5 text-slate-400">#{i + 1}</td>
                <td className="px-3 py-1.5 font-medium">
                  {green ? (
                    <span className="text-emerald-600">🟢 {t("sec.valid")}</span>
                  ) : (
                    <span className="text-red-600">🔴 {t(`sec.${st}`)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}