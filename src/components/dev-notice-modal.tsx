"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type DevNotice = {
  title: string;
  message: string;
  old_site_url: string | null;
  updated_at: string;
};

const STORAGE_PREFIX = "fdsa-dev-notice-dismissed:";

export default function DevNoticeModal({ notice }: { notice: DevNotice }) {
  const [open, setOpen] = useState(false);

  // Key includes updated_at, so re-saving the notice in admin (which bumps
  // updated_at) shows it again to everyone — even visitors who'd already
  // dismissed the previous version.
  const storageKey = STORAGE_PREFIX + notice.updated_at;

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(storageKey);
      if (!dismissed) setOpen(true);
    } catch {
      // localStorage unavailable (e.g. privacy mode) — just show it.
      setOpen(true);
    }
  }, [storageKey]);

  function handleClose() {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Ignore — worst case it shows again next visit.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md border border-brass/30 bg-paper p-6 shadow-2xl sm:p-8">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-charcoal/40 transition hover:text-ink"
        >
          <X size={18} />
        </button>

        <p
          className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Notice
        </p>
        <h2 className="mt-2 text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
          {notice.title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-charcoal/80">
          {notice.message}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleClose}
            className="flex-1 border border-ink px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
          >
            Continue to site
          </button>
          {notice.old_site_url && (
            <a
              href={notice.old_site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-brass bg-brass px-4 py-2.5 text-center text-sm font-medium text-ink transition hover:bg-brass/90"
            >
              Visit old website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}