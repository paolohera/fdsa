"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFacility } from "@/lib/facilities/actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function NewFacilityPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const { id } = await createFacility(formData);
      showToast("Facility created successfully", "success");
      router.push(`/admin/facilities/${id}/gallery`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create facility");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Add Facility
        </h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Create a new facility with cover image and gallery
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 border-b border-ink/10 pb-6">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Facility Information
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-ink mb-1">
                Facility Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                placeholder="e.g., Aircraft Hangar"
              />
            </div>

            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-ink mb-1">
                Short Description
              </label>
              <textarea
                id="short_description"
                name="short_description"
                rows={3}
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                placeholder="Brief description shown on facility cards..."
              />
            </div>

            <div>
              <label htmlFor="full_description" className="block text-sm font-medium text-ink mb-1">
                Full Description
              </label>
              <textarea
                id="full_description"
                name="full_description"
                rows={5}
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                placeholder="Detailed description for the facility detail page..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-b border-ink/10 pb-6 pt-6">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Cover Image
          </h3>
          <p className="text-xs text-charcoal/50">
            Optional. This image appears on facility cards and as the main image on the detail page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <input
                type="file"
                name="cover_image"
                accept="image/jpeg,image/png,image/webp"
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </label>
            <label className="flex-1">
              <input
                type="text"
                name="cover_alt"
                placeholder="Alt text (optional)"
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Gallery Images
          </h3>
          <p className="text-xs text-charcoal/50">
            Upload up to 10 images total (including cover). You can manage the gallery after creating the facility.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <input
                type="file"
                name="gallery_images"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Status & Order
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                className="h-4 w-4 rounded border-ink/20 text-brass focus:ring-brass"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-ink cursor-pointer">
                Published
              </label>
            </div>
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-ink mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-ink/10">
          <button
            type="button"
            onClick={() => history.back()}
            className="px-4 py-2 text-sm font-medium text-charcoal/60 hover:text-ink border border-ink/15 rounded-lg transition hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-ink bg-brass rounded-lg transition hover:bg-brass/90 disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create Facility"}
          </button>
        </div>
      </form>
    </div>
  );
}