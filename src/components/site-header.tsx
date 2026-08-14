"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import HeaderIntro from "@/components/header-intro";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/news", label: "News" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-parchment/95 backdrop-blur-sm">
      <HeaderIntro>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" data-animate className="flex items-center gap-3">
            <Image src="/fdsa-logo.png" alt="FDSA crest" width={40} height={40} priority />
            <div className="leading-tight">
              <p
                className="text-sm font-bold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                FDSA
              </p>
              <p className="hidden text-[10px] uppercase tracking-wider text-charcoal/50 sm:block">
                Flight Dynamics School of Aeronautics
              </p>
            </div>
          </Link>

          <nav data-animate className="hidden items-center gap-8 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-charcoal transition hover:text-brass"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            data-animate
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="text-ink md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </HeaderIntro>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/60 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[80%] transform bg-parchment shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Image src="/fdsa-logo.png" alt="FDSA crest" width={28} height={28} />
            <p
              className="text-sm font-bold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FDSA
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-ink"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-charcoal transition hover:bg-ink/5 hover:text-brass"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}   