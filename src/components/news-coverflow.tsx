"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";

type NewsSlide = {
  slug: string;
  title: string;
  imageUrl?: string | null;
};

// Fixed internals — tuned for a news-teaser use case rather than exposed as
// generic props, since this component has one job on this site.
const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
const DEPTH = 240;
const TILT = 10;
const SIDE_TILT = 8;
const GAP = 8;
const OPACITY = 55;
const DURATION = 0.6;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function NewsCoverflow({
  slides,
  cardWidth = 420,
  cardHeight = 320,
}: {
  slides: NewsSlide[];
  cardWidth?: number;
  cardHeight?: number;
}) {
  const router = useRouter();
  const n = slides.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive((a) => Math.max(0, Math.min(n - 1, a)));
  }, [n]);

  const lockRef = useRef(false);
  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, DURATION * 1000);
  }, []);

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current || n === 0) return;
      lock();
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n, lock]
  );

  const handleCardClick = useCallback(
    (i: number, slug: string) => {
      if (lockRef.current) return;
      if (i === active) {
        router.push(`/news/${slug}`);
        return;
      }
      lock();
      setActive(i);
    },
    [active, lock, router]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    },
    [step]
  );

  if (n === 0) return null;

  const dim = 1 - OPACITY / 100;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${PERSPECTIVE}px`,
        overflow: "hidden",
        outline: "none",
        minHeight: cardHeight + 40,
      }}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={onKeyDown}
    >
      <div
        style={{
          position: "relative",
          width: cardWidth,
          height: cardHeight,
          transformStyle: "preserve-3d",
        }}
      >
        {slides.map((slide, i) => {
          let rel = i - active;
          if (rel > n / 2) rel -= n;
          if (rel < -n / 2) rel += n;

          const ax = Math.abs(rel);
          const visible = ax <= MAX_VISIBLE;
          const isActive = rel === 0;
          const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
          const tx = rel * (GAP * 30);
          const tz = -ax * DEPTH;
          const ry = -rel * TILT;
          const rz = rel * SIDE_TILT;

          const cardStyle: CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: cardWidth,
            height: cardHeight,
            borderRadius: 4,
            overflow: "hidden",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
            transition: `transform ${DURATION}s ${EASE}, opacity ${DURATION}s ${EASE}`,
            opacity: visible ? 1 : 0,
            cursor: "pointer",
            pointerEvents: visible ? "auto" : "none",
            backgroundColor: "var(--color-ink)",
            border: "1px solid rgba(169,124,61,0.25)",
          };

          return (
            <div
              key={slide.slug}
              style={cardStyle}
              onClick={() => handleCardClick(i, slide.slug)}
              aria-label={slide.title}
              aria-hidden={!visible}
            >
              {slide.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    userSelect: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                      color: "rgba(245,240,230,0.5)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    FDSA
                  </span>
                </div>
              )}

              {/* Gradient for title legibility */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Title + Read more */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  right: 20,
                  bottom: 18,
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#F5F0E6",
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    fontFamily: "var(--font-display)",
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {slide.title}
                </span>
                {isActive && (
                  <span
                    style={{
                      display: "inline-flex",
                      marginTop: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#C99A4B",
                    }}
                  >
                    Read more →
                  </span>
                )}
              </div>

              {/* Dim overlay for non-active cards */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#000000",
                  opacity: isActive ? 0 : dim,
                  transition: `opacity ${DURATION}s ${EASE}`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}