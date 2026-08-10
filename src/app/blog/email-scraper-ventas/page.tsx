import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Qué es un email scraper y cómo usarlo para tus ventas",
  description:
    "Descubre qué es un email scraper, por qué extraer correos de documentos y cómo hacerlo de forma legal y sencilla con una herramienta en tu navegador.",
  alternates: { canonical: "/blog/email-scraper-ventas" },
};

export default function Post() {
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← Volver a PDF2Emails
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Qué es un email scraper y cómo usarlo para tus ventas
      </h1>
      <p className="mt-3 text-sm text-slate-500">Guía · 3 min de lectura</p>

      <div className="mt-8 space-y-4 text-slate-700">
        <p>
          Un <strong>email scraper</strong> es una herramienta que extrae direcciones de correo desde
          un documento o una fuente. Si trabajas con ventas, prospección o marketing B2B, convertir
          PDFs con contactos en una lista limpia de correos puede ahorrarte horas y potenciar tus
          campañas de <strong>cold email</strong>.
        </p>
        <h2 className="text-xl font-bold text-slate-900">¿Para qué sirve en ventas?</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Armar listas de prospectos a partir de directorios o ferias en PDF.</li>
          <li>Consolidar los contactos de proveedores y clientes.</li>
          <li>Alimentar tu CRM o tu herramienta de email marketing.</li>
        </ul>
        <h2 className="text-xl font-bold text-slate-900">Consejos legales</h2>
        <p>
          Extraer correos es totalmente legal cuando <strong>ya tienes el documento</strong> (por
          ejemplo, un directorio que te dieron). Respeta siempre las leyes de protección de datos de
          tu país y no uses listas para spam no solicitado.
        </p>
        <h2 className="text-xl font-bold text-slate-900">Hazlo en segundos con PDF2Emails</h2>
        <p>
          Arrastra tu PDF en{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">PDF2Emails</Link>{" "}
          y obtén la lista de correos lista para CSV. Filtra genéricos y personales, y descarga la
          lista completa para empezar a prospectar hoy mismo.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-semibold text-slate-800">Empieza gratis</p>
          <p className="mt-1 text-sm text-slate-500">Gratis para PDFs pequeños (hasta 5 páginas o 50 correos), sin registro.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Probar PDF2Emails →
          </Link>
        </div>
      </div>
    </article>
  );
}
