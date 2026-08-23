"use client";

import { useState, useTransition } from "react";
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
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(10, 10, 35, 0.4)" }}
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm"
            style={{
              backgroundColor: "#f5f0eb",
              border: "1px solid #d4af37",
              borderRadius: "8px",
              padding: "40px 32px 32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: "#0a0a23",
                fontSize: "18px",
                fontWeight: 500,
                fontFamily: "var(--font-display)",
                marginBottom: "12px",
                textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              {title}
            </h2>

            <p
              style={{
                color: "#0a0a23",
                fontSize: "14px",
                opacity: 0.7,
                fontFamily: "var(--font-body)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: "32px",
                padding: "0 4px",
              }}
            >
              {description}
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                style={{
                  background: "transparent",
                  border: "1px solid #d4af37",
                  borderRadius: "4px",
                  color: "#0a0a23",
                  fontSize: "14px",
                  padding: "10px 32px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-body)",
                  minWidth: "100px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(212, 175, 55, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                style={{
                  background: "#d4af37",
                  border: "1px solid #d4af37",
                  borderRadius: "4px",
                  color: "#f5f0eb",
                  fontSize: "14px",
                  padding: "10px 32px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  minWidth: "100px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#c4a030";
                  e.currentTarget.style.borderColor = "#c4a030";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#d4af37";
                  e.currentTarget.style.borderColor = "#d4af37";
                }}
              >
                {pending ? "..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}