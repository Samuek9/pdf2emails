import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extraer correos de un PDF online gratis (sin subir archivos)",
  description:
    "La forma más rápida de extraer correos de un PDF online: gratis, en tu navegador y sin subir archivos a servidores. Exporta a CSV o TXT.",
  alternates: { canonical: "/blog/extraer-correos-pdf-online-gratis" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Volver al Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extraer correos de un PDF online gratis (sin subir archivos)
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guía · 2 min de lectura</p>
      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          La mayoría de herramientas "online" suben tu PDF a un servidor. Con{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>{" "}
          todo se procesa <strong>en tu navegador</strong>: tu archivo nunca sale de tu equipo.
        </p>
        <h2 className="text-xl font-bold text-slate-900">¿Qué obtienes?</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Todos los correos del PDF en segundos.</li>
          <li>Filtros para quitar genéricos (info@, support@) y personales.</li>
          <li>Exportación a CSV o TXT.</li>
          <li>OCR para PDFs escaneados.</li>
        </ul>
        <p>Los PDFs pequeños (hasta 5 páginas y 50 correos) son gratis, sin registro.</p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Probar gratis →
          </Link>
        </div>
      </div>
    </article>
  );
}
