"use client";

import { useEffect, useRef } from "react";
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

  useGSAP(
    () => {
      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current!,
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        normalizeScroll: true,
      });
    },
    { scope: wrapperRef }
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