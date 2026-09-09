"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

interface FacilityImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

interface FacilityImageCarouselProps {
  images: FacilityImage[];
  facilityTitle: string;
}

export function FacilityImageCarousel({ images, facilityTitle }: FacilityImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageCount = images.length;

  const goTo = useCallback((index: number) => {
    if (isAnimating || index < 0 || index >= imageCount) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 400);
  }, [imageCount, isAnimating]);

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + imageCount) % imageCount);
  }, [currentIndex, imageCount, goTo]);

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % imageCount);
  }, [currentIndex, imageCount, goTo]);

  useEffect(() => {
    if (imageCount <= 1) return;
    const timer = setInterval(() => {
      if (!isAnimating) goNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [imageCount, isAnimating, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goPrev();
    else if (e.key === "ArrowRight") goNext();
  };

  if (imageCount === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Image gallery for ${facilityTitle}`}
    >
      <div
        className="relative overflow-hidden rounded-xl bg-ink/5"
        style={{ aspectRatio: "16 / 9" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-400 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            display: "flex",
            width: `${imageCount * 100}%`,
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              className="flex flex-1 items-center justify-center"
              style={{ width: `${100 / imageCount}%` }}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || `${facilityTitle} - Image ${i + 1}`}
                className="h-full w-full object-cover"
                loading={i === currentIndex ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {imageCount > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={isAnimating}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-brass transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brass"
              aria-label="Previous image"
              aria-disabled={isAnimating}
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <button
              onClick={goNext}
              disabled={isAnimating}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-brass transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brass"
              aria-label="Next image"
              aria-disabled={isAnimating}
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 text-xs font-medium text-white/90 bg-black/40 px-2 py-1 rounded">
          {currentIndex + 1} / {imageCount}
        </div>
      </div>

      {imageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={images[i].id}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "bg-brass w-3"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`View image ${i + 1} of ${imageCount}`}
              aria-current={i === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );
}