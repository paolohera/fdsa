"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
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

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-paper p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/70">{description}</p>

            <div className="mt-6 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setOpen(false)}
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
      )}
    </>
  );
}