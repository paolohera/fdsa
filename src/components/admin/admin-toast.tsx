"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "loading" | "warning" | "info";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  showToast: (message: string, variant?: ToastVariant, options?: { duration?: number; onClose?: () => void }) => number;
  updateToast: (id: number, message: string, variant: ToastVariant) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}

let nextId = 1;

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  loading: <Loader2 size={16} className="shrink-0 animate-spin text-brass" />,
  success: <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />,
  error: <XCircle size={16} className="shrink-0 text-red-400" />,
  warning: <AlertTriangle size={16} className="shrink-0 text-amber-400" />,
  info: <Info size={16} className="shrink-0 text-sky-400" />,
};

const variantStyles: Record<ToastVariant, string> = {
  loading: "bg-ink",
  success: "bg-ink",
  error: "bg-ink",
  warning: "bg-ink",
  info: "bg-ink",
};

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success", options?: { duration?: number; onClose?: () => void }) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const duration = options?.duration ?? (variant === "loading" ? 0 : 4000);
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
          options?.onClose?.();
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  const updateToast = useCallback(
    (id: number, message: string, variant: ToastVariant) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, variant } : t)));
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, updateToast, dismissToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm text-parchment shadow-xl ${variantStyles[toast.variant]}`}
            style={{ animation: "toast-in 0.2s ease-out" }}
            role="alert"
            aria-live="assertive"
          >
            {variantIcons[toast.variant]}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}