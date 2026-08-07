"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
      {/* Background image — update the path below to match your actual file */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      {/* Parchment tint so text/stats stay readable over any photo */}
      <div className="absolute inset-0 bg-parchment/70" />

      <div
        className="relative flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full shrink-0 px-2 py-10 sm:px-8">
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 sm:grid-cols-[1fr_auto_1fr]">
              {/* Left: program info */}
              <div className="order-2 text-center sm:order-1 sm:text-left">
                <h2
                  className="text-2xl leading-tight text-ink sm:text-3xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-charcoal/70 sm:mx-0">
                    {slide.description}
                  </p>
                )}
                <Link
                  href={slide.cta_url}
                  className="mt-5 inline-block bg-ink px-6 py-3 text-sm font-medium text-parchment transition hover:bg-brass"
                >
                  {slide.cta_label}
                </Link>
              </div>

              {/* Center: student image, U-shaped crop */}
              <div className="order-1 flex justify-center sm:order-2">
                <div className="h-64 w-48 overflow-hidden rounded-t-none rounded-b-[999px] border-4 border-paper shadow-lg sm:h-80 sm:w-60">
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
                  <div key={stat.id}>
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