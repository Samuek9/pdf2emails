"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { extractTextFromFile } from "@/lib/pdf";

const MAX_SIZE_MB = 30;

interface PdfDropzoneProps {
  onParsed: (text: string, numPages: number, fileName: string) => void;
}

export function PdfDropzone({ onParsed }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Solo se aceptan archivos PDF.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
        return;
      }
      setIsLoading(true);
      try {
        const { text, numPages } = await extractTextFromFile(file);
        trackEvent("pdf_uploaded", {
          fileName: file.name,
          numPages,
          fileSizeBytes: file.size,
        });
        onParsed(text, numPages, file.name);
      } catch {
        setError(
          "No pudimos leer el PDF. Asegúrate de que no esté protegido con contraseña ni dañado.",
        );
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
      setError("No se pudo cargar el PDF de ejemplo.");
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
      onClick={() => inputRef.current?.click()}
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
          <p className="text-sm font-medium text-slate-600">Leyendo PDF…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <FileUp size={26} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              Arrastra tu PDF aquí o{" "}
              <span className="text-emerald-600 underline underline-offset-2">elige un archivo</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PDF · hasta {MAX_SIZE_MB} MB · se procesa 100% en tu navegador · sin registro
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void loadSample();
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 underline underline-offset-2 transition hover:text-emerald-700"
            >
              <Sparkles size={13} /> Probar con un PDF de ejemplo
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
