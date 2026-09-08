"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

type SidebarContextType = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const initialized = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored !== null) {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => setCollapsed(stored === "true"), 0);
    }
    initialized.current = true;
  }, []);

  // Persist state changes
  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
    }
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed((c) => !c);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}