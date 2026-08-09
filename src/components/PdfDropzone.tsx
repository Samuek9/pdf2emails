"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2, ScanSearch, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { extractTextFromFile, extractTextWithOcr } from "@/lib/pdf";
import { t, ocrLang } from "@/lib/i18n";

const MAX_SIZE_MB = 15;

interface PdfDropzoneProps {
  onParsed: (text: string, numPages: number, fileName: string) => void;
}

export function PdfDropzone({ onParsed }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [needsOcr, setNeedsOcr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setNeedsOcr(false);
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError(t("drop.error.type"));
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(t("drop.error.size", { max: MAX_SIZE_MB }));
        return;
      }
      setIsLoading(true);
      lastFileRef.current = file;
      try {
        const { text, numPages } = await extractTextFromFile(file);
        if (numPages > 30) { setError(t("drop.error.pages")); return; }
        trackEvent("pdf_uploaded", { fileName: file.name, numPages, fileSizeBytes: file.size });
        if (text.trim().length === 0) {
          // Parece escaneado (sin capa de texto): ofrecemos OCR.
          setNeedsOcr(true);
        } else {
          onParsed(text, numPages, file.name);
        }
      } catch {
        setError(t("drop.error.parse"));
        trackEvent("pdf_parse_error", { fileName: file.name });
      } finally {
        setIsLoading(false);
      }
    },
    [onParsed],
  );

  async function loadSample() {
    try {
      const res = await fetch("/sample-emails.pdf");
      if (!res.ok) throw new Error("no sample");
      const blob = await res.blob();
      const file = new File([blob], "sample-emails.pdf", { type: "application/pdf" });
      await handleFile(file);
    } catch {
      setError(t("drop.sampleError"));
    }
  }

  async function runOcr() {
    if (!lastFileRef.current) return;
    setError(null);
    setOcrRunning(true);
    try {
      const { text, numPages } = await extractTextWithOcr(lastFileRef.current, ocrLang());
      if (numPages > 30) { setError(t("drop.error.pages")); return; }
      trackEvent("ocr_completed", { fileName: lastFileRef.current.name, numPages });
      onParsed(text, numPages, lastFileRef.current.name);
    } catch {
      setError(t("drop.error.parse"));
    } finally {
      setOcrRunning(false);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
      onClick={() => {
        if (!isLoading && !ocrRunning) inputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`rounded-2xl border-2 border-dashed px-6 py-2 text-center transition ${
        isDragging
          ? "border-emerald-500 bg-emerald-50/60"
          : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-slate-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 size={36} className="animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-600">{t("drop.loading")}</p>
        </div>
      ) : ocrRunning ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 size={36} className="animate-spin text-amber-600" />
          <p className="text-sm font-medium text-slate-600">{t("drop.ocrRunning")}</p>
        </div>
      ) : needsOcr ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ScanSearch size={26} />
          </div>
          <p className="text-base font-semibold text-slate-800">{t("drop.ocr")}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void runOcr();
            }}
            className="btn-primary"
          >
            <ScanSearch size={16} /> {t("drop.ocr")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNeedsOcr(false);
            }}
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
          >
            {t("drop.title")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <FileUp size={26} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              {t("drop.title")}{" "}
              <span className="text-emerald-600 underline underline-offset-2">{t("drop.choose")}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">{t("drop.sub", { max: MAX_SIZE_MB })}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void loadSample();
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 underline underline-offset-2 transition hover:text-emerald-700"
            >
              <Sparkles size={13} /> {t("drop.sample")}
            </button>
            <p className="mt-3 inline-flex items-start gap-1.5 text-left text-xs font-semibold leading-snug text-emerald-600">
              {t("drop.private")}
            </p>
          </div>
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}