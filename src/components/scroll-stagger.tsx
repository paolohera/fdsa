"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type ScrollStaggerProps = {
  children: ReactNode;
  className?: string;
};

// Each direct child gets its own independent ScrollTrigger, rather than
// one shared tween animating an array of targets via GSAP's `stagger`
// option. The shared-stagger approach was leaving later items stuck
// mid-animation in this app (cause not fully isolated) — giving every
// item its own trigger, the same proven mechanism ScrollReveal already
// uses correctly for single elements, sidesteps it entirely.
export default function ScrollStagger({ children, className }: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const items = Array.from(ref.current.children);

      items.forEach((item, i) => {
        gsap.from(item, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}