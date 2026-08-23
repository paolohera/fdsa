"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProgramItem = {
  href: string;
  code: string;
  imageSrc?: string;
};

const DEFAULTS = {
  collapsedWidth: 90,
  hoverWidth: 190,
  collapsedHeight: 340,
  hoverHeight: 400,
  gap: 12,
  influence: 220,
};

// Lerp factor per animation frame — matches the original Originkit component
// (0.2). This is what makes the motion feel smooth: the JS loop is the ONLY
// thing animating width/height. No CSS transition runs alongside it, since
// stacking a CSS transition on top of a per-frame JS update causes the two
// easing systems to fight each other and feel laggy.
const LERP_SPEED = 0.2;

const MOBILE_BREAKPOINT = 640;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

function ProgramImage({ item }: { item: ProgramItem }) {
  return item.imageSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.imageSrc}
      alt={item.code}
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)",
      }}
    >
      <span
        className="px-2 text-center text-[9px] uppercase tracking-[0.25em] text-parchment/50"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Photo coming soon
      </span>
    </div>
  );
}

// Mobile: a plain grid of tappable cards, code + "View more" only.
function MobileProgramList({ items }: { items: ProgramItem[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => router.push(item.href)}
          className="group relative block h-44 w-full overflow-hidden border border-ink/15 text-left"
        >
          <ProgramImage item={item} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3
              className="text-lg text-parchment"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
            >
              {item.code}
            </h3>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-parchment/80">
              View more &rarr;
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// Desktop: the magnetic hover-dock effect — one bar per individual program,
// labeled by code only. Width/height are driven purely by the JS rAF loop
// below (no CSS transition on them), matching the original component's
// approach for genuinely smooth, lag-free tracking.
//
// The outer wrapper has a FIXED height equal to hoverHeight, and cards are
// bottom-aligned within it — so a growing card expands upward into already-
// reserved space instead of pushing the page's layout (and footer) around.
function DesktopMagneticCarousel({
  items,
  collapsedWidth,
  hoverWidth,
  collapsedHeight,
  hoverHeight,
  gap,
  influence,
}: {
  items: ProgramItem[];
  collapsedWidth: number;
  hoverWidth: number;
  collapsedHeight: number;
  hoverHeight: number;
  gap: number;
  influence: number;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [factors, setFactors] = useState<number[]>(() => items.map(() => 0));

  const targetRef = useRef<number[]>(items.map(() => 0));
  const curRef = useRef<number[]>(items.map(() => 0));
  const loopRef = useRef(0);

  useEffect(() => {
    targetRef.current = items.map(() => 0);
    curRef.current = items.map(() => 0);
    setFactors(items.map(() => 0));
  }, [items.length]);

  useEffect(() => () => cancelAnimationFrame(loopRef.current), []);

  const startLoop = () => {
    if (loopRef.current) return;
    const step = () => {
      const tgt = targetRef.current;
      const cur = curRef.current;
      let moving = false;
      for (let i = 0; i < cur.length; i++) {
        const d = (tgt[i] ?? 0) - cur[i];
        if (Math.abs(d) > 0.001) {
          cur[i] += d * LERP_SPEED;
          moving = true;
        } else {
          cur[i] = tgt[i] ?? 0;
        }
      }
      setFactors([...cur]);
      loopRef.current = moving ? requestAnimationFrame(step) : 0;
    };
    loopRef.current = requestAnimationFrame(step);
  };

  const setTargetFromCursor = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = clientX - rect.left;
    const n = items.length;
    const totalBase = n * collapsedWidth + (n - 1) * gap;
    const startX = (rect.width - totalBase) / 2;
    targetRef.current = items.map((_, i) => {
      const center = startX + i * (collapsedWidth + gap) + collapsedWidth / 2;
      const dist = Math.abs(cx - center);
      const f = Math.max(0, 1 - dist / influence);
      return f * f * (3 - 2 * f); // smoothstep falloff
    });
    startLoop();
  };

  const onMove = (e: React.MouseEvent) => setTargetFromCursor(e.clientX);
  const onLeave = () => {
    targetRef.current = items.map(() => 0);
    startLoop();
  };

  const sizeFor = (i: number) => {
    const f = factors[i] ?? 0;
    return {
      width: collapsedWidth + (hoverWidth - collapsedWidth) * f,
      height: collapsedHeight + (hoverHeight - collapsedHeight) * f,
    };
  };

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-wrap items-end justify-center"
      style={{
        gap,
        position: "relative",
        // Fixed height reserves space for the tallest possible card state
        // up front, so hovering never changes the container's own size.
        height: hoverHeight,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {items.map((item, i) => {
        const { width, height } = sizeFor(i);
        const f = factors[i] ?? 0;
        return (
          <div
            key={item.href}
            role="link"
            tabIndex={0}
            onClick={() => router.push(item.href)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(item.href);
              }
            }}
            style={{
              flex: "none",
              width,
              height,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              // No CSS transition on width/height — the rAF loop above is
              // the sole driver of size, exactly like the original.
              transition: "none",
              willChange: "width, height",
            }}
            className="border border-ink/15"
          >
            <ProgramImage item={item} />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.8) 100%)",
              }}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
              <h3
                className="text-parchment"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18 + f * 6,
                  lineHeight: 1.2,
                  textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                {item.code}
              </h3>
              <span
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-parchment/80"
                style={{ opacity: f > 0.3 ? 1 : 0, transition: "opacity 0.15s ease" }}
              >
                View more &rarr;
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MagneticProgramCarousel({
  items,
  collapsedWidth = DEFAULTS.collapsedWidth,
  hoverWidth = DEFAULTS.hoverWidth,
  collapsedHeight = DEFAULTS.collapsedHeight,
  hoverHeight = DEFAULTS.hoverHeight,
  gap = DEFAULTS.gap,
  influence = DEFAULTS.influence,
}: {
  items: ProgramItem[];
  collapsedWidth?: number;
  hoverWidth?: number;
  collapsedHeight?: number;
  hoverHeight?: number;
  gap?: number;
  influence?: number;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileProgramList items={items} />;
  }

  return (
    <DesktopMagneticCarousel
      items={items}
      collapsedWidth={collapsedWidth}
      hoverWidth={hoverWidth}
      collapsedHeight={collapsedHeight}
      hoverHeight={hoverHeight}
      gap={gap}
      influence={influence}
    />
  );
}