"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const pathname = usePathname();
  const [smoothEnabled, setSmoothEnabled] = useState(false);

  useEffect(() => {
    // Smooth scroll only runs on desktop/tablet-width viewports with a
    // non-touch-only input. ScrollSmoother's virtualized (position: fixed +
    // transform) scroll fights mobile browsers' own touch handling and can
    // leave the page unscrollable, and its normalizeScroll layer can also
    // swallow taps on buttons/links in the mobile nav. ScrollTrigger.isTouch
    // (0 = no touch, 1 = touch-only, 2 = both) isn't fully reliable on its
    // own — some devices, and Chrome DevTools' device emulator, report "2"
    // even when the real experience should be treated as mobile — so we
    // also gate on viewport width (matching the site's `md` breakpoint,
    // same one the nav uses to switch to the mobile menu). Mobile-width
    // viewports always get plain native scrolling, full stop.
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const evaluate = () => {
      setSmoothEnabled(ScrollTrigger.isTouch !== 1 && mediaQuery.matches);
    };

    evaluate();
    mediaQuery.addEventListener("change", evaluate);
    return () => mediaQuery.removeEventListener("change", evaluate);
  }, []);

  useGSAP(
    () => {
      if (!smoothEnabled || !wrapperRef.current) return;

      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        // normalizeScroll's touch handling can otherwise swallow taps on
        // buttons/links (it treats touch interactions as potential scroll
        // gestures) — allowClicks explicitly lets real taps through.
        normalizeScroll: { allowClicks: true },
      });

      document.documentElement.classList.add("gsap-smooth-active");
      document.body.classList.add("gsap-smooth-active");

      return () => {
        document.documentElement.classList.remove("gsap-smooth-active");
        document.body.classList.remove("gsap-smooth-active");
      };
    },
    { dependencies: [smoothEnabled], scope: wrapperRef }
  );

  // Reset scroll position on client-side navigation so the new page starts
  // at the top (App Router keeps this layout mounted across route changes,
  // so scroll position otherwise carries over from the previous page).
  //
  // Deliberately NOT calling ScrollTrigger.refresh() here: the new page's
  // ScrollReveal/ScrollStagger components create their own triggers fresh
  // on mount, already measuring correct positions — they don't need it.
  // A refresh() shortly after navigation was actually landing mid-flight
  // on staggered animations (each card starts ~0.12s apart) and killing
  // them partway through, leaving later items stuck faded. Don't add it
  // back without a very good reason.
  useEffect(() => {
    smootherRef.current?.scrollTo(0, false);
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}