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
    // Touch-only devices (phones/tablets) get native scrolling.
    // ScrollSmoother's virtualized (position: fixed + transform) scroll
    // fights mobile browsers' own touch handling and can leave the page
    // completely unscrollable. Desktops/laptops (mouse or hybrid input)
    // get the smooth momentum scroll. ScrollTrigger.isTouch: 0 = no touch,
    // 1 = touch-only, 2 = both — we only skip smoothing on pure-touch (1).
    setSmoothEnabled(ScrollTrigger.isTouch !== 1);
  }, []);

  useGSAP(
    () => {
      if (!smoothEnabled || !wrapperRef.current) return;

      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        normalizeScroll: true,
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

  // Reset scroll and re-measure trigger positions on client-side navigation
  // (App Router keeps this layout mounted across route changes).
  useEffect(() => {
    smootherRef.current?.scrollTo(0, false);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}