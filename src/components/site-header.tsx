"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import HeaderIntro from "@/components/header-intro";

const NAV_LEFT = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/facilities", label: "Facilities" },

];

const NAV_RIGHT = [
  { href: "/news", label: "News & Events" },
  { href: "/contact", label: "Contact" },
  { href: "/help-centre", label: "Help Centre" },
];

const NAV_LINKS = [...NAV_LEFT, ...NAV_RIGHT];

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
    <div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85%] transform bg-ink shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        {...(!open ? { inert: true } : {})}
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
              key={link.label}
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
    </div>
  );

  return (
    <header
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className={[
        "fixed inset-x-0 top-0 z-40 border-b-2 border-brass/70 bg-ink/95 backdrop-blur-md transition-all duration-500 ease-out",
        scrolled ? "shadow-[0_8px_24px_-16px_rgba(0,0,0,0.5)]" : "shadow-none",
      ].join(" ")}
    >
      <HeaderIntro>
        {/* ---- Desktop / tablet: split nav with overlapping center crest ---- */}
        <div className="relative mx-auto hidden h-16 max-w-6xl items-center justify-between px-6 md:flex lg:h-[80px]">
          <nav data-animate className="flex items-center gap-1 text-sm">
            {NAV_LEFT.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold uppercase tracking-wide text-parchment/90 transition-colors duration-300 hover:text-parchment lg:px-4"
              >
                {link.label}
                <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Center crest — absolutely positioned so it can overflow below the header
              into the hero, independent of the flex row's own height. */}
          <Link
            href="/"
            data-animate
            aria-label="FDSA home"
            className="group absolute left-1/2 top-0 z-20 -translate-x-1/2"
          >
            <div className="crest-shape flex h-[100px] w-[112px] items-start justify-center bg-brass pt-1 pb-1 transition-transform duration-300 mt-[-17] lg:h-[170px] lg:w-[200px]">
              <div className="crest-shape flex h-full w-full items-center justify-center bg-ink pt-3">
                <Image
                  src="/fdsa-logo.png"
                  alt="FDSA crest"
                  width={150}
                  height={150}
                  priority
                  className="h-20 w-20 object-contain lg:h-30 lg:w-30 mt-[-17]" 
                />
              </div>
            </div>
          </Link>

          <nav data-animate className="flex items-center gap-1 text-sm">
            {NAV_RIGHT.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group relative rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold uppercase tracking-wide text-parchment/90 transition-colors duration-300 hover:text-parchment lg:px-4"
              >
                {link.label}
                <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
        </div>

        {/* ---- Mobile: small logo left, hamburger right ---- */}
        <div className="flex h-14 items-center justify-between px-5 md:hidden">
          <Link href="/" data-animate className="flex items-center gap-2.5">
            <Image src="/fdsa-logo.png" alt="FDSA crest" width={36} height={36} priority />
            <p
              className="text-sm font-bold text-parchment"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FDSA
            </p>
          </Link>

          <button
            type="button"
            data-animate
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
            className="relative z-10 -m-2 rounded-full p-3.5 text-parchment transition-colors duration-300 active:bg-white/15"
          >
            <Menu size={22} />
          </button>
        </div>
      </HeaderIntro>

      {mounted && createPortal(drawer, document.body)}
    </header>
  );
}