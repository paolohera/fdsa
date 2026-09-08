"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { updateFacility, deleteFacility, getFacility } from "@/lib/facilities/actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";
import { format } from "date-fns";

interface Facility {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  cover_image: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFacility() {
    try {
      setLoading(true);
      const { id } = await params;
      const data = await getFacility(id);
      if (!data) {
        router.push("/admin/facilities");
        return;
      }
      setFacility(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load facility", "error");
      router.push("/admin/facilities");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateFacility(facility!.id, formData);
      showToast("Facility updated successfully", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update facility");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this facility? This will also delete all gallery images.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteFacility(facility!.id);
      showToast("Facility deleted successfully", "success");
      router.push("/admin/facilities");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete facility", "error");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-brass" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : facility ? (
        <div>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
                Edit Facility
              </h1>
              <p className="mt-2 text-sm text-charcoal/60">Editing: {facility.title}</p>
            </div>
            <Link
              href={`/admin/facilities/${facility.id}/gallery`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal/60 hover:text-ink border border-ink/15 rounded-lg transition hover:bg-ink/5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Manage Gallery
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                    defaultValue={facility.title}
                    required
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-ink mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    defaultValue={facility.slug}
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                    placeholder="auto-generated from title"
                  />
                  <p className="mt-1 text-xs text-charcoal/50">Leave empty to auto-generate from title</p>
                </div>

                <div>
                  <label htmlFor="short_description" className="block text-sm font-medium text-ink mb-1">
                    Short Description
                  </label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    defaultValue={facility.short_description || ""}
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
                    defaultValue={facility.full_description || ""}
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
                The cover image appears on facility cards and as the main image on the detail page.
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
              {facility.cover_image && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={facility.cover_image} alt="" className="h-20 w-28 object-cover rounded-md" />
                  <span className="text-xs text-charcoal/50">Current cover image</span>
                </div>
              )}
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
                    defaultChecked={facility.is_published}
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
                    defaultValue={facility.display_order}
                    min={0}
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-ink/10">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600/30 rounded-lg transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete Facility"}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/admin/facilities"
                  className="px-4 py-2 text-sm font-medium text-charcoal/60 hover:text-ink border border-ink/15 rounded-lg transition hover:bg-ink/5"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-ink bg-brass rounded-lg transition hover:bg-brass/90 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}