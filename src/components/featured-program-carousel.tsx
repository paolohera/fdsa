"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";

type ContentSlide = {
  type: "content";
  imageUrl?: string | null;
  track: string;
  code: string;
  name: string;
  description: string;
  href: string;
};

type ImageSlide = {
  type: "image";
  imageUrl: string;
};

type Slide = ContentSlide | ImageSlide;
type Side = "left" | "right" | "none";
type SlideAnim = { from: number; to: number; dir: 1 | -1; run: boolean };

const DURATION_MS = 600;
const EASE = "cubic-bezier(0.42, 0, 0.58, 1)";
const CURSOR_SIZE = 64;

// Scalloped "seal" outline for the offer badge, generated with trig rather
// than a static image — alternates between an outer and inner radius around
// the circle to produce the classic medal/sticker edge.
function buildSealClipPath(points = 20, outerR = 50, innerR = 43) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points;
    const x = 50 + r * Math.sin(angle);
    const y = 50 - r * Math.cos(angle);
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
}
const SEAL_CLIP_PATH = buildSealClipPath();

export default function FeaturedProgramCarousel({
  program,
  galleryImages,
}: {
  program: {
    code: string;
    track: string;
    name: string;
    description: string;
    image_url: string | null;
    link_href: string;
  };
  galleryImages: { image_url: string }[];
}) {
  const href = program.link_href || "/programs";

  const slides: Slide[] = [
    {
      type: "content",
      imageUrl: program.image_url,
      track: program.track,
      code: program.code,
      name: program.name,
      description: program.description,
      href,
    },
    ...galleryImages.map((g): ImageSlide => ({ type: "image", imageUrl: g.image_url })),
  ];

  const count = slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState<SlideAnim | null>(null);
  const slidingRef = useRef(false);
  const pointerRef = useRef<{ relX: number; width: number } | null>(null);
  const [cursorSide, setCursorSide] = useState<Side>("none");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  const sideFor = useCallback(
    (relX: number, width: number, atIndex: number): Side => {
      if (width <= 0 || count <= 1) return "none";
      const wantPrev = relX < width / 2;
      if (wantPrev) return atIndex > 0 ? "left" : "none";
      return atIndex < count - 1 ? "right" : "none";
    },
    [count]
  );

  const goTo = useCallback(
    (to: number, dir: 1 | -1) => {
      if (slidingRef.current || to === index) return;
      slidingRef.current = true;
      setAnim({ from: index, to, dir, run: false });
    },
    [index]
  );

  const startSlide = useCallback(
    (dir: 1 | -1) => {
      const to = index + dir;
      if (to < 0 || to >= count) return;
      goTo(to, dir);
    },
    [index, count, goTo]
  );

  // Two-frame delay before flipping `run` so the "to" layer mounts at its
  // off-screen starting position first, then transitions in — otherwise
  // the browser can coalesce the initial position and the animated one
  // into a single paint and the slide never visibly moves.
  useEffect(() => {
    if (!anim) return;
    if (!anim.run) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setAnim((s) => (s ? { ...s, run: true } : s)));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    const t = setTimeout(() => {
      const committed = anim.to;
      setIndex(committed);
      setAnim(null);
      slidingRef.current = false;
      const p = pointerRef.current;
      if (p) setCursorSide(sideFor(p.relX, p.width, committed));
    }, DURATION_MS + 40);
    return () => clearTimeout(t);
  }, [anim, sideFor]);

  // Auto-advance every 5s — pauses while hovering (so it doesn't yank the
  // slide away mid-browse) and wraps back to the first slide at the end.
  useEffect(() => {
    if (count <= 1 || isHovering) return;
    const timer = setInterval(() => {
      if (slidingRef.current) return;
      goTo((index + 1) % count, 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [count, index, isHovering, goTo]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      pointerRef.current = { relX, width: rect.width };
      setCursorPos({ x: relX, y: relY });
      setCursorSide(sideFor(relX, rect.width, index));
      if (!isHovering) setIsHovering(true);
    },
    [sideFor, index, isHovering]
  );

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = null;
    setCursorSide("none");
    setIsHovering(false);
  }, []);

  const handleClick = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el || slidingRef.current) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const side = sideFor(relX, rect.width, index);
      if (side === "left") startSlide(-1);
      else if (side === "right") startSlide(1);
    },
    [sideFor, index, startSlide]
  );

  if (count === 0) return null;

  const activeIndex = anim?.run ? anim.to : anim ? anim.from : index;

  const layerTransform = (role: "from" | "to"): string => {
    if (!anim) return "translateX(0%)";
    const { dir, run } = anim;
    if (role === "to") {
      const start = dir === 1 ? "100%" : "-100%";
      return run ? "translateX(0%)" : `translateX(${start})`;
    }
    const end = dir === 1 ? "-100%" : "100%";
    return run ? `translateX(${end})` : "translateX(0%)";
  };
  const layerTransition = (run: boolean) => (run ? `transform ${DURATION_MS}ms ${EASE}` : "none");

  function renderSlide(slideData: Slide, interactive: boolean) {
    return (
      <>
        {slideData.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slideData.imageUrl}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              userSelect: "none",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)",
            }}
          />
        )}

        {slideData.type === "content" && (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0.85) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                bottom: 40,
                pointerEvents: interactive ? "auto" : "none",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#C99A4B",
                  fontFamily: "var(--font-display)",
                }}
              >
                {slideData.track}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "#F5F0E6",
                  fontSize: "clamp(22px, 3.6vw, 34px)",
                  lineHeight: 1.15,
                  fontFamily: "var(--font-display)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {slideData.name}
              </span>
              <span
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginTop: 8,
                  maxWidth: 560,
                  color: "rgba(245,240,230,0.85)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {slideData.description}
              </span>
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
                {/* Static for now — no href/action yet */}
                <span
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#C99A4B",
                    color: "#171717",
                    padding: "10px 22px",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "default",
                  }}
                >
                  Enroll Now
                </span>

                <Link
                  href={slideData.href}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#C99A4B",
                  }}
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  const wrapperStyle = (transform: string, transition: string): CSSProperties => ({
    position: "absolute",
    inset: 0,
    transform,
    transition,
    willChange: "transform",
  });

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        cursor: cursorSide === "none" ? "default" : "none",
        userSelect: "none",
        touchAction: "manipulation",
        border: "1px solid rgba(169,124,61,0.25)",
        backgroundColor: "var(--color-ink)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {anim ? (
          <>
            <div style={wrapperStyle(layerTransform("from"), layerTransition(anim.run))}>
              {renderSlide(slides[anim.from], false)}
            </div>
            <div style={wrapperStyle(layerTransform("to"), layerTransition(anim.run))}>
              {renderSlide(slides[anim.to], anim.run)}
            </div>
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>{renderSlide(slides[index], true)}</div>
        )}
      </div>

      {/* Fixed to the frame (not a slide) so it stays put through
          transitions. A scalloped gold "seal" badge, built with a CSS
          clip-path (no external image asset) rather than a stock graphic. */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 5,
          pointerEvents: "none",
          width: 104,
          height: 104,
        }}
      >
        <div
          className="fpc-badge-pulse"
          style={{
            position: "absolute",
            inset: 0,
            clipPath: SEAL_CLIP_PATH,
            background:
              "linear-gradient(135deg, #F6D785 0%, #C99A4B 35%, #8B6B2B 70%, #C99A4B 100%)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 11,
            borderRadius: "50%",
            border: "2px solid rgba(43,29,8,0.35)",
            background:
              "radial-gradient(circle at 35% 30%, #EACB79 0%, #B5872F 62%, #7A5A22 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 6px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 2 }}>
            <circle cx="12" cy="13" r="8" stroke="#2B1D08" strokeWidth={2} />
            <path d="M12 9v4l3 2" stroke="#2B1D08" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 2h6M12 2v2" stroke="#2B1D08" strokeWidth={2} strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "#2B1D08",
              lineHeight: 1.15,
            }}
          >
            LIMITED TIME
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.02em",
              color: "#241A08",
              lineHeight: 1.1,
              fontFamily: "var(--font-display)",
            }}
          >
            OFFER
          </span>
        </div>
      </div>
      <style>{`
        @keyframes fpc-badge-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(201,154,75,0)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 10px rgba(201,154,75,0.6)); }
        }
        .fpc-badge-pulse {
          animation: fpc-badge-pulse 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Corner ribbon, top-left. Uses its own small clipping box (the
          standard corner-ribbon technique) instead of relying on the much
          larger carousel frame's clip — that was cutting the text off
          unpredictably. Two lines so the phrase fits without shrinking the
          font past readable size. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 150,
          height: 150,
          overflow: "hidden",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: -42,
            width: 200,
            transform: "rotate(-45deg)",
            background: "linear-gradient(135deg, #E9C570 0%, #8B6B2B 100%)",
            color: "#241A08",
            textAlign: "center",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            padding: "6px 0",
            lineHeight: 1.35,
            boxShadow: "0 3px 10px rgba(0,0,0,0.4)",
          }}
        >
          Now Offering
          <br />
          Sheet Metal
        </div>
      </div>

      {cursorSide !== "none" && (
        <div
          style={{
            position: "absolute",
            left: cursorPos.x,
            top: cursorPos.y,
            width: CURSOR_SIZE,
            height: CURSOR_SIZE,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        >
          <svg
            width={CURSOR_SIZE * 0.42}
            height={CURSOR_SIZE * 0.42}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#171717"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={cursorSide === "right" ? "9 6 15 12 9 18" : "15 6 9 12 15 18"} />
          </svg>
        </div>
      )}

      {count > 1 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 16,
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            pointerEvents: "none",
          }}
        >
          {slides.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === activeIndex ? "#F5F0E6" : "rgba(245,240,230,0.4)",
                transition: `background ${DURATION_MS}ms ${EASE}`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}