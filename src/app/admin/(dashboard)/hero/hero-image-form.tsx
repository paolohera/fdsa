"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/admin-ui";

export default function HeroImageForm({
  action,
  currentImageUrl,
}: {
  action: (formData: FormData) => void;
  currentImageUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form action={action}>
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-ink/5">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Homepage hero preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
            <span className="text-xs uppercase tracking-widest text-charcoal/40">
              No hero image set
            </span>
            <span className="text-[11px] text-charcoal/30">
              Falls back to /hero-background.png on the live site
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <span className="block truncate text-sm text-charcoal/60 file:mr-3 file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-ink/10">
            {fileName ?? "Choose an image…"}
          </span>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setFileName(file.name);
              }
            }}
          />
        </label>
        <AdminButton type="submit">
          {currentImageUrl ? "Replace" : "Upload"}
        </AdminButton>
      </div>
      <p className="mt-2 text-xs text-charcoal/40">
        Recommend a wide landscape photo, at least 1920px wide.
        {fileName && " Preview shown above — click Replace to save it."}
      </p>
    </form>
  );
}