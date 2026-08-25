"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Toast = {
  id: number;
  message: string;
  variant: "success" | "error" | "loading";
};

type ToastContextType = {
  showToast: (message: string, variant?: Toast["variant"]) => number;
  updateToast: (id: number, message: string, variant: Toast["variant"]) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}

let nextId = 1;

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: Toast["variant"] = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (variant !== "loading") {
        setTimeout(() => dismissToast(id), 3000);
      }
      return id;
    },
    [dismissToast]
  );

  const updateToast = useCallback(
    (id: number, message: string, variant: Toast["variant"]) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, variant } : t)));
      if (variant !== "loading") {
        setTimeout(() => dismissToast(id), 3000);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, updateToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2.5 rounded-lg bg-ink px-4 py-3 text-sm text-parchment shadow-xl"
            style={{ animation: "toast-in 0.2s ease-out" }}
          >
            {toast.variant === "loading" && (
              <Loader2 size={16} className="shrink-0 animate-spin text-brass" />
            )}
            {toast.variant === "success" && (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            )}
            {toast.variant === "error" && (
              <XCircle size={16} className="shrink-0 text-red-400" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}