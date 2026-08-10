import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo extraer correos de un PDF gratis y rápido",
  description:
    "Aprende a extraer todos los correos electrónicos de un PDF online, gratis y sin subir archivos. Filtra genéricos y personales y exporta a CSV o TXT.",
  alternates: { canonical: "/blog/extraer-correos-de-un-pdf" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Volver a PDF2Emails
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Cómo extraer correos de un PDF gratis y rápido
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guía · 3 min de lectura</p>

      <div className="prose mt-8 space-y-4 text-slate-700">
        <p>
          Los PDFs son el formato más común para compartir documentos: listados, directorios, CVs,
          facturas, catálogos. Pero cuando necesitas <strong>los correos electrónicos que están
          dentro</strong>, copiarlos uno por uno es un dolor. Aquí te mostramos la forma más rápida y
          segura de hacerlo.
        </p>
        <h2 className="text-xl font-bold text-slate-900">¿Por qué extraer emails de un PDF?</h2>
        <p>
          Desde construir listas de prospectos para ventas o marketing hasta consolidar contactos de
          proveedores, tener los correos en una hoja de cálculo (CSV) te permite usarlos con tu CRM,
          tu herramienta de email marketing o tu agenda.
        </p>
        <h2 className="text-xl font-bold text-slate-900">La forma más fácil: una herramienta online</h2>
        <p>
          No necesitas instalar nada. Con{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>{" "}
          solo arrastras tu PDF y la herramienta detecta <strong>todos los correos</strong> en
          segundos. Puedes filtrar los genéricos (info@, support@…) y los personales (@gmail.com,
          @hotmail.com) para quedarte con los corporativos, y exportar la lista a{" "}
          <strong>CSV o TXT</strong>. Todo se procesa en tu navegador: el archivo nunca se sube a un
          servidor.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Paso a paso</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Entra a PDF2Emails y arrastra tu PDF (o usa el PDF de ejemplo).</li>
          <li>Revisa los correos — los PDFs pequeños (hasta 5 páginas o 50 correos) son 100% gratis.</li>
          <li>Activa los filtros de genéricos y personales si los necesitas.</li>
          <li>Desbloquea la lista completa y descarga el CSV o TXT.</li>
        </ol>
        <h2 className="text-xl font-bold text-slate-900">¿Y si el PDF es un escaneo?</h2>
        <p>
          Si tu PDF es una imagen escaneada (sin texto seleccionable), activa la opción de{" "}
          <strong>OCR</strong> en la herramienta para leer el texto de la imagen y extraer los
          correos igualmente.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-semibold text-slate-800">Prueba la herramienta gratis ahora</p>
          <p className="mt-1 text-sm text-slate-500">Gratis para PDFs pequeños (hasta 5 páginas o 50 correos), sin registro.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Extraer correos de un PDF →
          </Link>
        </div>
      </div>
    </article>
  );
}
