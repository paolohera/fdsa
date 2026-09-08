"use client";

import { useSidebar } from "@/components/admin/sidebar-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SidebarCollapseToggle() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal/60 transition hover:bg-ink/5 hover:text-ink lg:hidden lg:flex"
    >
      {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  );
}