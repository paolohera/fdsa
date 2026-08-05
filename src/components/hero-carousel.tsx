"use client";

import { useEffect, useRef, useState } from "react";

type HeroCarouselProps = {
  images: { id: string; image_url: string }[];
};

const SLIDE_INTERVAL_MS = 5000;

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = images.length;

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
      <div className="flex h-[420px] w-full items-center justify-center bg-ink/5">
        <p className="text-sm text-charcoal/50">
          No slides yet — add images from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-ink">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="h-full w-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-ink transition hover:bg-paper"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-ink transition hover:bg-paper"
          >
            &rarr;
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  goTo(i);
                  restartTimer();
                }}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-paper" : "bg-paper/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}