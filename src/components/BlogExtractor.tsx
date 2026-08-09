"use client";

import { useState } from "react";
import { ArrowRight, Copy, Download } from "lucide-react";
import { PdfDropzone } from "@/components/PdfDropzone";
import { parseAllEmails } from "@/lib/emails";
import type { ExtractedEmail } from "@/lib/types";

/**
 * Widget para embeber en el blog / casos de uso: deja que el visitante pruebe
 * la extraccion en el acto (sin registro) y lo envia a la herramienta completa.
 */
export function BlogExtractor() {
  const [emails, setEmails] = useState<ExtractedEmail[] | null>(null);
  const [copied, setCopied] = useState(false);

  function handleParsed(text: string) {
    const { all } = parseAllEmails(text);
    setEmails(all);
  }

  function copyAll() {
    if (!emails) return;
    navigator.clipboard
      ?.writeText(emails.map((e) => e.email).join("\n"))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="card p-4 sm:p-6">
      <p className="text-sm font-bold text-slate-800">Probar gratis ahora · sin registro</p>
      <div className="mt-3">
        <PdfDropzone onParsed={handleParsed} />
      </div>

      {emails && emails.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">
            {emails.length} correo{emails.length === 1 ? "" : "s"} encontrado{emails.length === 1 ? "" : "s"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {emails.slice(0, 12).map((e) => (
              <span key={e.email} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                {e.email}
              </span>
            ))}
            {emails.length > 12 && (
              <span className="px-2 py-1 text-xs text-slate-400">+{emails.length - 12} más…</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copyAll} className="btn-secondary !py-2 text-xs">
              <Copy size={14} /> {copied ? "Copiado!" : "Copiar todos"}
            </button>
            <a href="https://pdf2emails.com" className="btn-primary !py-2 text-xs">
              <Download size={14} /> Descargar CSV gratis <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
