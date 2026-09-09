"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string | null;
}

/**
 * Single unified gallery: one hero viewer + a thumbnail strip below it.
 * Pass ALL images (cover included) as one array — do not render the
 * cover image separately elsewhere on the page, or you'll get two
 * stacked hero blocks with no visual distinction between them.
 */
export function GalleryViewer({
  images,
  facilityTitle,
}: {
  images: GalleryImage[];
  facilityTitle: string;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasMultiple = images.length > 1;

  const navigateGallery = (direction: number) => {
    setCurrentImageIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  const mainImage = images[currentImageIndex]?.image_url;

  if (images.length === 0) {
    return (
      <div
        className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl"
        style={{ background: placeholderBg }}
      >
        <span
          className="text-xs uppercase tracking-[0.3em] text-parchment/50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Photo coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Hero / main image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-ink/5">
        <img
          src={mainImage}
          alt={
            images[currentImageIndex]?.alt_text ||
            `${facilityTitle} - Image ${currentImageIndex + 1}`
          }
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {hasMultiple && (
          <>
            <button
              onClick={() => navigateGallery(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-brass transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brass"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigateGallery(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-brass transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brass"
              aria-label="Next image"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
            <div className="absolute bottom-3 right-3 text-xs font-medium text-white/90 bg-black/40 px-2 py-1 rounded">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip — only when there's more than one image */}
      {hasMultiple && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrentImageIndex(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all snap-start ${
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
      )}
    </div>
  );
}