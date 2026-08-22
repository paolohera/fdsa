"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminNavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  /**
   * Set true only for links that have genuine nested sub-routes (e.g.
   * News Management -> /admin/news/new, /admin/news/[id]). Sibling routes
   * that merely share a URL prefix (e.g. the About Page section) must NOT
   * set this, or they'll falsely stay highlighted on their siblings' pages.
   */
  matchNested?: boolean;
};

export default function AdminNavLink({ href, label, icon, badge, matchNested = false }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active =
    pathname === href || (matchNested && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-l-4 px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-brass bg-white/10 text-white"
          : "border-transparent text-parchment/60 hover:bg-white/5 hover:text-parchment/90"
      }`}
    >
      <span className={active ? "text-brass" : ""}>{icon}</span>
      <span className="flex-1">{label}</span>
      {!!badge && badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brass px-1.5 text-[11px] font-bold text-ink">
          {badge}
        </span>
      )}
    </Link>
  );
}