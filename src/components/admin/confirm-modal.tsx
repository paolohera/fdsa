"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { AdminButton } from "@/components/admin/admin-ui";

export default function ConfirmModal({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  const handleClose = useCallback(() => {
    if (!pending) {
      setOpen(false);
      previouslyFocusedRef.current?.focus();
    }
  }, [pending]);

  const handleOpen = useCallback(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    setOpen(true);
    setTimeout(() => modalRef.current?.focus(), 0);
  }, []);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, pending, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const modalContent = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 px-4 pb-4 backdrop-blur-sm"
      onClick={() => !pending && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-sm bg-paper p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
            <p id="confirm-modal-description" className="mt-1 text-sm leading-6 text-charcoal/70">{description}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-charcoal/50 transition hover:bg-ink/10 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-charcoal/70">{description}</p>

        <div className="mt-6 flex justify-end gap-2">
          <AdminButton
            variant="secondary"
            type="button"
            onClick={handleClose}
            disabled={pending}
          >
            Cancel
          </AdminButton>
          <AdminButton
            variant={variant === "danger" ? "danger" : "primary"}
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className={`!gap-2 ${
              variant === "danger"
                ? "!bg-red-600 !px-4 !py-2.5 !text-parchment hover:!bg-red-700 hover:!text-parchment"
                : ""
            }`}
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            {pending ? "Please wait…" : confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <span onClick={handleOpen} ref={triggerRef}>{trigger}</span>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}