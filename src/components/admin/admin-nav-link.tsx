"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminNavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
};

export default function AdminNavLink({ href, label, icon }: AdminNavLinkProps) {
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
      {label}
    </Link>
  );
}