import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Extraer correos de un PDF escaneado con OCR — gratis",
  description:
    "Convierte un PDF escaneado (imagen) en una lista limpia de correos usando OCR. 100% gratis y privado en tu navegador, sin subir archivos ni registrarte.",
  alternates: { canonical: "/es/use-cases/extraer-correos-de-pdf-escaneado" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Extraer correos de un PDF escaneado con OCR
      </h1>
      <p className="mt-3 text-sm text-slate-500">Herramienta · Gratis · OCR incluido</p>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Los PDFs escaneados son imágenes sin texto seleccionable: la mayoría de herramientas fallan.{" "}
          <Link href="/es" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>{" "}
          detecta los escaneos y ejecuta <strong>OCR en tu navegador</strong> para leer el texto y extraer
          cada correo.
        </p>
        <p>
          Privado (sin subidas), gratis para PDFs pequeños, y puedes limpiar y verificar la lista para
          proteger tu dominio del bloqueo por spam.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Link href="/es" className="inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700">
            Extraer correos de un PDF escaneado →
          </Link>
        </div>
      </div>
    </div>
  );
}
