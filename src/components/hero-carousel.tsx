"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type HeroStat = {
  id: string;
  value: string;
  label: string;
};

type HeroSlide = {
  id: string;
  image_url: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  stats: HeroStat[];
};

type HeroCarouselProps = {
  slides: HeroSlide[];
};

const SLIDE_INTERVAL_MS = 3000;

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const count = slides.length;

  function goTo(next: number) {
    if (count === 0) return;
    setIndex(((next % count) + count) % count);
  }

  function restartTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, SLIDE_INTERVAL_MS);
  }

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // GSAP-driven slide transition (replaces plain CSS transition) plus a
  // stagger-in for the active slide's own content each time it becomes
  // active — image, headline, description, CTA, and stats each arrive
  // slightly offset rather than just sliding in as one flat block.
  useGSAP(
    () => {
      if (!trackRef.current) return;

      gsap.to(trackRef.current, {
        x: `-${index * 100}%`,
        duration: 0.9,
        ease: "power3.inOut",
      });

      const activeSlide = slideRefs.current[index];
      if (activeSlide) {
        const targets = activeSlide.querySelectorAll("[data-animate]");
        gsap.fromTo(
          targets,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.25,
            overwrite: true,
          }
        );
      }
    },
    { dependencies: [index], scope: trackRef }
  );

  function handlePrev() {
    goTo(index - 1);
    restartTimer();
  }

  function handleNext() {
    goTo(index + 1);
    restartTimer();
  }

  if (count === 0) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center bg-ink/5">
        <p className="text-sm text-charcoal/50">
          No slides yet — add one from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Background image — update the path below to match your actual file. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      {/* Parchment tint so text/stats stay readable over any photo */}
      <div className="absolute inset-0 bg-parchment/85" />

      <div ref={trackRef} className="relative flex">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-full shrink-0 px-2 py-10 sm:px-8"
          >
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 sm:grid-cols-[1fr_auto_1fr]">
              {/* Left: program info */}
              <div className="order-2 text-center sm:order-1 sm:text-left">
                <h2
                  data-animate
                  className="text-2xl leading-tight text-ink sm:text-3xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {slide.title}
                </h2>
                {slide.description && (
                  <p
                    data-animate
                    className="mx-auto mt-3 max-w-xs text-sm leading-6 text-charcoal/70 sm:mx-0"
                  >
                    {slide.description}
                  </p>
                )}
                <Link
                  href={slide.cta_url}
                  data-animate
                  className="mt-5 inline-block bg-ink px-6 py-3 text-sm font-medium text-parchment transition hover:bg-brass"
                >
                  {slide.cta_label}
                </Link>
              </div>

              {/* Center: student image, U-shaped crop */}
              <div className="order-1 flex justify-center sm:order-2">
                <div
                  data-animate
                  className="h-64 w-48 overflow-hidden rounded-t-none rounded-b-[999px] border-4 border-paper shadow-lg sm:h-80 sm:w-60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Right: stats */}
              <div className="order-3 flex justify-center gap-6 text-center sm:justify-end sm:gap-8 sm:text-right">
                {slide.stats.map((stat) => (
                  <div key={stat.id} data-animate>
                    <p
                      className="text-2xl text-ink sm:text-3xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1 max-w-[8rem] text-xs leading-4 text-charcoal/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow transition hover:bg-paper sm:left-4"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow transition hover:bg-paper sm:right-4"
          >
            &rarr;
          </button>

          <div className="mt-2 flex justify-center gap-2 pb-4">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  goTo(i);
                  restartTimer();
                }}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-brass" : "bg-ink/20"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}