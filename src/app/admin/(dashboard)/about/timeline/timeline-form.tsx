"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";
import { useFormAction } from "@/hooks/useFormAction";

type TimelineFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    year: string;
    title: string;
    body: string;
    image_url?: string | null;
  };
  error?: string;
};

export default function TimelineForm({ action, defaultValues, error }: TimelineFormProps) {
  const [preview, setPreview] = useState<string | null>(defaultValues?.image_url ?? null);
  const { submit, pending } = useFormAction({
    action,
    successMessage: defaultValues ? "Timeline entry updated" : "Timeline entry created",
    errorMessage: "Failed to save timeline entry",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminCard className="p-6">
            <label className="block">
              <span className="text-sm font-medium text-ink">Year (or label)</span>
              <input
                name="year"
                type="text"
                required
                placeholder="e.g. 1988 or Today"
                defaultValue={defaultValues?.year}
                className="mt-1.5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-brass"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-ink">Title</span>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. A Hangar in Manila"
                defaultValue={defaultValues?.title}
                className="mt-1.5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-brass"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-ink">Description</span>
              <textarea
                name="body"
                rows={5}
                required
                placeholder="What happened in this chapter…"
                defaultValue={defaultValues?.body}
                className="mt-1.5 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-brass"
              />
            </label>

            <AdminButton type="submit" disabled={pending} className="mt-5">
              {pending && <Loader2 size={14} className="animate-spin mr-1" />}
              {pending ? "Saving…" : "Save"}
            </AdminButton>
          </AdminCard>
        </div>

        <div className="lg:col-span-1">
          <AdminCard className="p-5">
            <h3 className="border-b border-ink/10 pb-3 text-sm font-semibold uppercase tracking-wide text-ink">
              Archival photo
            </h3>

            <label className="mt-4 block cursor-pointer">
              <div className="group relative aspect-[4/3] w-full overflow-hidden border border-dashed border-ink/20 bg-ink/[0.02] transition-colors hover:border-brass/50">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-charcoal/40">
                    <ImagePlus size={22} />
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
                disabled={pending}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
            <p className="mt-2 text-xs text-charcoal/40">
              Optional — leave blank to show the &ldquo;archival photo placeholder&rdquo; box instead.
            </p>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}