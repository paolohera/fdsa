"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import HeaderIntro from "@/components/header-intro";

type NavLink = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const NAV_LEFT: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/facilities", label: "Facilities" },
];

const NAV_RIGHT: NavLink[] = [
  { href: "/news", label: "News & Events" },
  { href: "/contact", label: "Contact" },
  { href: "/help-centre", label: "Help Centre" },
];

const NAV_LINKS: NavLink[] = [...NAV_LEFT, ...NAV_RIGHT];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);

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

  // Collapse the mobile Programs accordion whenever the drawer itself closes,
  // so it doesn't stay expanded the next time the menu opens.
  useEffect(() => {
    if (!open) setProgramsOpen(false);
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
          {NAV_LINKS.map((link, i) =>
            link.children ? (
              <div
                key={link.label}
                style={{ transitionDelay: open ? `${i * 60 + 100}ms` : "0ms" }}
                className={`transition-all duration-300 ease-out ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setProgramsOpen((v) => !v)}
                  aria-expanded={programsOpen}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide text-parchment/90 transition-colors duration-300 hover:bg-white/10 hover:text-parchment"
                >
                  {link.label}
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${
                      programsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    programsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden pl-3">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-parchment/70 transition-colors duration-300 hover:bg-white/10 hover:text-parchment"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
            )
          )}
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
        "fixed inset-x-0 top-0 z-40 border-b-2 border-brass/100 bg-ink/95 backdrop-blur-md transition-all duration-500 ease-out",
        scrolled ? "shadow-[0_8px_24px_-16px_rgba(0,0,0,0.5)]" : "shadow-none",
      ].join(" ")}
    >
      <HeaderIntro>
        {/* ---- Desktop / tablet: split nav with overlapping center crest ---- */}
        <div className="relative mx-auto hidden h-16 max-w-6xl items-center justify-between px-6 md:flex lg:h-[80px]">
          <nav data-animate className="flex items-center gap-1 text-sm">
            {NAV_LEFT.map((link) =>
              link.children ? (
                <div key={link.href} className="group/item relative">
                  <Link
                    href={link.href}
                    className="group/link relative flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold uppercase tracking-wide text-parchment/90 transition-colors duration-300 hover:text-parchment lg:px-4"
                  >
                    {link.label}
                    <ChevronDown
                      size={13}
                      className="mt-px transition-transform duration-300 group-hover/item:rotate-180"
                    />
                    <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
                  </Link>

                  {/* Dropdown panel — revealed on hover of the wrapping group,
                      so hovering either the label or the panel keeps it open. */}
                  <div className="invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-1 pt-2 opacity-0 transition-all duration-200 ease-out group-hover/item:visible group-hover/item:translate-y-0 group-hover/item:opacity-100">
                    <div className="w-56 overflow-hidden rounded-lg border border-white/10 bg-ink shadow-xl">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-xs font-semibold uppercase tracking-wide text-parchment/80 transition-colors duration-200 hover:bg-white/10 hover:text-parchment"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold uppercase tracking-wide text-parchment/90 transition-colors duration-300 hover:text-parchment lg:px-4"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </Link>
              )
            )}
          </nav>

          {/* Center crest — absolutely positioned so it can overflow below the header
              into the hero, independent of the flex row's own height. */}
          <Link
            href="/"
            data-animate
            aria-label="FDSA home"
            className="group absolute left-1/2 top-0 z-20 -translate-x-1/2"
          >
            <div className="crest-shape flex h-[100px] w-[112px] items-start justify-center bg-brass pt-1.5 pb-1.5 transition-transform duration-300 mt-[-17] lg:h-[170px] lg:w-[200px]">
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