"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminNavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

export default function AdminNavLink({ href, label, icon, badge }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

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