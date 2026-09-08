"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export function GalleryViewer({
  images,
  coverImage,
  facilityTitle,
}: {
  images: Array<{ id: string; image_url: string; alt_text: string | null }>;
  coverImage: string | undefined;
  facilityTitle: string;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigateGallery = (direction: number) => {
    setCurrentImageIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  const setMainImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const mainImage = images[currentImageIndex]?.image_url || coverImage;

  return (
    <div className="group relative">
      {/* Main image viewer */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-ink/5">
        <img
          src={mainImage || placeholderBg}
          alt={facilityTitle}
          className="w-full h-full object-cover transition-opacity duration-300"
          id="main-gallery-image"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigateGallery(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-brass transition opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => navigateGallery(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-brass transition opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setMainImage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentImageIndex
                  ? "bg-brass"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === currentImageIndex ? "true" : "false"}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setMainImage(i)}
            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              i === currentImageIndex
                ? "border-brass"
                : "border-transparent hover:border-brass/50"
              }`}
            aria-label={`View image ${i + 1} of ${images.length}`}
            aria-current={i === currentImageIndex ? "true" : "false"}
          >
            <img
              src={img.image_url}
              alt={img.alt_text || `${facilityTitle} - Image ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}