"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer = (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85%] transform bg-ink shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Image src="/fdsa-logo.png" alt="FDSA crest" width={32} height={32} />
            <p
              className="text-sm font-bold text-parchment"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FDSA
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-parchment transition-transform duration-300 hover:rotate-90"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-5">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${i * 60 + 100}ms` : "0ms" }}
              className={`rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide text-parchment/90 transition-all duration-300 ease-out hover:bg-white/10 hover:text-parchment ${
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur-md transition-all duration-500 ease-out",
        scrolled ? "shadow-[0_8px_24px_-16px_rgba(0,0,0,0.5)]" : "shadow-none",
      ].join(" ")}
    >
      <HeaderIntro>
        <div
          className={[
            "mx-auto flex max-w-5xl items-center justify-between px-6 transition-[padding] duration-500 ease-out",
            scrolled ? "py-2" : "py-3 sm:py-4",
          ].join(" ")}
        >
          <Link href="/" data-animate className="flex items-center gap-3">
            <Image src="/fdsa-logo.png" alt="FDSA crest" width={52} height={52} priority />
            <div className="leading-tight">
              <p
                className="text-base font-bold text-parchment"
                style={{ fontFamily: "var(--font-display)" }}
              >
                FDSA
              </p>
              <p className="hidden text-[10px] uppercase tracking-wider text-parchment/60 sm:block">
                Flight Dynamics School of Aeronautics
              </p>
            </div>
          </Link>

          <nav data-animate className="hidden items-center gap-1 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-4 py-1.5 font-semibold uppercase tracking-wide text-parchment/90 transition-colors duration-300 hover:text-parchment"
              >
                {link.label}
                <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <button
            type="button"
            data-animate
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-full p-1.5 text-parchment transition-colors duration-300 hover:bg-white/10 md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </HeaderIntro>

      {mounted && createPortal(drawer, document.body)}
    </header>
  );
}