import Link from "next/link";
import { Mail } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Mail size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">PDF2Emails</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 sm:flex">
          <a href="#como-funciona" className="transition hover:text-slate-900">Cómo funciona</a>
          <a href="#precios" className="transition hover:text-slate-900">Precios</a>
          <a href="#faq" className="transition hover:text-slate-900">FAQ</a>
        </nav>
        <a href="#extractor" className="btn-primary !px-4 !py-2">
          Probar gratis
        </a>
      </div>
    </header>
  );
}
