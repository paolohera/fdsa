"use client";

import { useSidebar } from "@/components/admin/sidebar-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarContentProps {
  sidebarContent: React.ReactNode;
}

export function SidebarContent({ sidebarContent }: SidebarContentProps) {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <div
      className={`
        flex flex-col h-full transition-all duration-300 ease-out
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <nav className="flex-1 overflow-y-auto transition-all duration-300 ease-out">
        <div className={collapsed ? "px-2 py-4" : "px-3 py-6"}>
          {sidebarContent}
        </div>
      </nav>

      {/* Collapse toggle at bottom */}
      <div className="border-t border-parchment/10 transition-all duration-300 ease-out">
        <div className={collapsed ? "px-2 py-3" : "px-3 py-4"}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-lg text-charcoal/50 transition hover:bg-white/5 hover:text-parchment"
          >
            {collapsed ? (
              <>
                <ChevronRight size={18} className="text-parchment/70" />
                {!collapsed && <span className="text-sm font-medium text-parchment/70">Expand</span>}
              </>
            ) : (
              <>
                <ChevronLeft size={18} className="text-parchment/70" />
                <span className="text-sm font-medium text-parchment/70">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}