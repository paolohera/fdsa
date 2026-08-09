"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeaderIntro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const targets = ref.current.querySelectorAll("[data-animate]");
      gsap.from(targets, {
        opacity: 0,
        y: -18,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      });
    },
    { scope: ref }
  );

  return <div ref={ref}>{children}</div>;
}