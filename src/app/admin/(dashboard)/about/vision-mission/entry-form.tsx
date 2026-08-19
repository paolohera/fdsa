// ============================================================
// DESTINATION: src/app/admin/(dashboard)/about/vision-mission/entry-form.tsx  (NEW file)
// ============================================================

"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";

type EntryFormProps = {
  action: (formData: FormData) => void;
  label: string;
  defaultValues: {
    heading: string;
    body: string;
    image_url?: string | null;
  };
};

export default function VisionMissionEntryForm({ action, label, defaultValues }: EntryFormProps) {
  const [preview, setPreview] = useState<string | null>(defaultValues.image_url ?? null);

  return (
    <form action={action}>
      <div className="grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <AdminCard className="h-full p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brass">{label}</h3>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-ink">Heading</span>
              <input
                name="heading"
                type="text"
                required
                defaultValue={defaultValues.heading}
                className="mt-1.5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-brass"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-ink">Body text</span>
              <textarea
                name="body"
                rows={5}
                required
                defaultValue={defaultValues.body}
                className="mt-1.5 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-brass"
              />
            </label>

            <AdminButton type="submit" className="mt-5">
              Save {label}
            </AdminButton>
          </AdminCard>
        </div>

        <div className="sm:col-span-1">
          <AdminCard className="p-5">
            <h4 className="border-b border-ink/10 pb-3 text-xs font-semibold uppercase tracking-wide text-ink">
              Photo
            </h4>

            <label className="mt-4 block cursor-pointer">
              <div className="group relative aspect-[4/3] w-full overflow-hidden border border-dashed border-ink/20 bg-ink/[0.02] transition-colors hover:border-brass/50">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-charcoal/40">
                    <ImagePlus size={20} />
                    <span className="text-xs">Click to upload</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs font-medium text-parchment opacity-0 transition-opacity group-hover:opacity-100">
                  {preview ? "Replace photo" : "Choose file"}
                </div>
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
            <p className="mt-2 text-xs text-charcoal/40">
              Preview updates immediately, but the photo only uploads when you click Save{" "}
              {label}.
            </p>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}