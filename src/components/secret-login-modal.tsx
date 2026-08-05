"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginModal } from "@/app/admin/login/actions";

const TRIGGER_PRESSES = 3;
const TRIGGER_WINDOW_MS = 1200;

export default function SecretLoginModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pressTimesRef = useRef<number[]>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Watch for 3 spacebar presses in quick succession, anywhere on the page,
  // as long as the person isn't typing into a field.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (open) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      if (e.code !== "Space") return;

      const now = Date.now();
      const recent = pressTimesRef.current.filter(
        (t) => now - t < TRIGGER_WINDOW_MS
      );
      recent.push(now);
      pressTimesRef.current = recent;

      if (recent.length >= TRIGGER_PRESSES) {
        pressTimesRef.current = [];
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close on Escape; focus the email field on open.
  useEffect(() => {
    if (!open) return;

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEsc);

    const focusTimer = setTimeout(() => emailInputRef.current?.focus(), 50);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      clearTimeout(focusTimer);
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginModal(formData);

    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.push("/admin");
    router.refresh();
  }

 if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-sm bg-paper px-8 py-9 shadow-2xl"
        style={{ animation: "modal-in 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-brass" />

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-5 top-5 text-charcoal/30 transition hover:text-charcoal"
        >
          &times;
        </button>

        <p
          className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brass"
          style={{ fontFamily: "var(--font-display)" }}
        >
          FDSA Staff
        </p>
        <h2
          className="mt-1.5 text-2xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sign in
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <p className="border-l-2 border-red-400 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="modal-email"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-charcoal/50"
            >
              Email
            </label>
            <input
              ref={emailInputRef}
              id="modal-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border-0 border-b border-ink/20 bg-transparent px-0 py-1.5 text-sm text-ink outline-none transition focus:border-brass"
            />
          </div>

          <div>
            <label
              htmlFor="modal-password"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-charcoal/50"
            >
              Password
            </label>
            <input
              id="modal-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border-0 border-b border-ink/20 bg-transparent px-0 py-1.5 text-sm text-ink outline-none transition focus:border-brass"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink py-3 text-xs font-semibold uppercase tracking-[0.2em] text-parchment transition hover:bg-brass disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}