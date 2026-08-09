import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo extraer emails de un PDF sin instalar software",
  description:
    "Extrae los correos de un PDF sin instalar nada: gratis, online y sin subir archivos. Filtra genéricos y personales y exporta a CSV o TXT.",
  alternates: { canonical: "/blog/extraer-emails-pdf-sin-software" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Volver al Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Cómo extraer emails de un PDF sin instalar software
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guía · 2 min de lectura</p>
      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          No necesitas programas de pago ni instalaciones. Con una herramienta en el navegador puedes
          sacar todos los correos de un PDF en segundos, <strong>sin subir tu archivo a ningún
          servidor</strong>.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Los pasos</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Arrastra tu PDF en PDF2Emails.</li>
          <li>Revisa los primeros 5 correos gratis.</li>
          <li>Filtra genéricos y personales si lo necesitas.</li>
          <li>Descarga el CSV o TXT con la lista completa.</li>
        </ol>
        <p>
          ¿El PDF es un escaneo? Activa la opción de <strong>OCR</strong> para leer el texto de la
          imagen.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Extraer emails de un PDF gratis →
          </Link>
        </div>
      </div>
    </article>
  );
}
