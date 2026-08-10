"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { t } from "@/lib/i18n";

// Las anclas (#faq, #precios, #como-funciona) viven SOLO en la home (/{locale}).
// Este componente navega a la home con el hash y hace scroll tras el montaje.
function AnchorLink({ id, children }: { id: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  function getLocale(): string {
    if (typeof window === "undefined") return "es";
    const c = document.cookie.split("; ").find((r) => r.startsWith("user_locale="));
    return c ? c.split("=")[1] || "es" : "es";
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const inHome = pathname === "/" || /^\/[a-z]{2}$/.test(pathname ?? "");
    if (inHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/${getLocale()}#${id}`);
    }
  }

  useEffect(() => {
    if (!window.location.hash) return;
    const anchor = window.location.hash.slice(1);
    if (anchor !== id) return;
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
  }, [pathname, id]);

  return (
    <a href={`#${id}`} onClick={handleClick} className="transition hover:text-slate-900">
      {children}
    </a>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <Mail size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">{t("brand")}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 sm:flex">
          <AnchorLink id="como-funciona">{t("nav.how")}</AnchorLink>
          <AnchorLink id="precios">{t("nav.pricing")}</AnchorLink>
          <AnchorLink id="faq">{t("nav.faq")}</AnchorLink>
          <Link href="/blog" className="transition hover:text-slate-900">
            {t("nav.blog")}
          </Link>
        </nav>
        <AnchorLink id="extractor">
          <span className="btn-primary !px-4 !py-2">{t("nav.try")}</span>
        </AnchorLink>
      </div>
    </header>
  );
}
