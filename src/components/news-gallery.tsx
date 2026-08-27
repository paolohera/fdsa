"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryItem = { image_url: string };

export default function NewsGallery({ images }: { images: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const close = () => setOpenIndex(null);
  const prev = () =>
    setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  const next = () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));

  return (
    <div className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-brass">Gallery</h2>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.image_url}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="aspect-square overflow-hidden border border-ink/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_url}
              alt=""
              // First few thumbnails are likely above the fold; load them
              // right away and defer the rest so the page doesn't wait on
              // images the visitor may never scroll to.
              loading={i < 3 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 text-parchment/80 transition hover:text-parchment"
          >
            <X size={26} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-4 text-parchment/80 transition hover:text-parchment"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex].image_url}
            alt=""
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-4 text-parchment/80 transition hover:text-parchment"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}