import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extraer correos de un PDF de facturas a Excel",
  description:
    "Extrae todos los correos de facturas y documentos en PDF y expórtalos a Excel. 100% privado en tu navegador, sin subir archivos y gratis.",
  alternates: { canonical: "/es/blog/extraer-correos-de-un-pdf-facturas" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog" className="text-sm font-semibold text-emerald-600 hover:underline">
        ← Volver al Blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extraer correos de un PDF de facturas a Excel
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guía · 2 min de lectura</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Contadores y administradores reciben decenas de facturas en PDF y necesitan armar bases de
          datos de proveedores y clientes. Copiar los correos a mano toma horas.
        </p>
        <p>
          Con{" "}
          <Link href="/es" className="font-semibold text-emerald-600 hover:underline">PDF2Emails</Link>{" "}
          subes las facturas, extraes todos los correos en segundos y los exportas a{" "}
          <strong>CSV o Excel</strong> para tu contabilidad — todo dentro de tu navegador, sin enviar
          documentos sensibles a ningún servidor.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link href="/es" className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
            Probar el extractor gratis →
          </Link>
        </div>
      </div>
    </article>
  );
}
