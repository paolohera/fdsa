"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  uploadFacilityImage,
  deleteFacilityImage,
  setCoverImage,
  updateImageOrder,
  getFacilityImages,
  getFacility,
  type Facility,
  type FacilityImage,
} from "@/lib/facilities/actions";
import { AdminBadge } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";
import { format } from "date-fns";

export default function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [images, setImages] = useState<FacilityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const { id } = await params;
      const [facilityData, imagesData] = await Promise.all([
        getFacility(id),
        getFacilityImages(id),
      ]);
      if (!facilityData) {
        router.push("/admin/facilities");
        return;
      }
      setFacility(facilityData);
      setImages(imagesData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load gallery", "error");
      router.push("/admin/facilities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [router]);

  async function handleUpload(files: FileList) {
    if (!facility) return;
    const maxAllowed = 10 - images.length;
    const filesToUpload = Array.from(files).slice(0, maxAllowed);

    if (filesToUpload.length === 0) {
      showToast("Maximum of 10 images per facility reached", "error");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of filesToUpload) {
        await uploadFacilityImage(facility!.id, file, null, images.length === 0);
      }
      showToast(`${filesToUpload.length} image${filesToUpload.length > 1 ? "s" : ""} uploaded`, "success");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image? This action cannot be undone.")) return;

    setDeletingId(imageId);
    try {
      await deleteFacilityImage(imageId, facility!.id);
      showToast("Image deleted", "success");
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete image", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetCover(imageId: string) {
    try {
      await setCoverImage(facility!.id, imageId);
      showToast("Cover image updated", "success");
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to set cover", "error");
    }
  }

  async function handleReorder(newImages: FacilityImage[]) {
    const orders = newImages.map((img, index) => ({
      id: img.id,
      display_order: index,
    }));
    try {
      await updateImageOrder(facility!.id, orders);
      setImages(newImages);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reorder", "error");
      await loadData();
    }
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(targetIndex: number): React.DragEventHandler<HTMLDivElement> {
    return (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (sourceIndex === targetIndex) return;

      const newImages = [...images];
      const [moved] = newImages.splice(sourceIndex, 1);
      newImages.splice(targetIndex, 0, moved);
      handleReorder(newImages);
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-brass" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!facility) return null;

  const remainingSlots = 10 - images.length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link
              href={`/admin/facilities/${facility.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/60 hover:text-ink mb-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Facility
            </Link>
            <h1 className="text-3xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Gallery: {facility.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <AdminBadge tone={facility.is_published ? "green" : "slate"}>
              {facility.is_published ? "Published" : "Draft"}
            </AdminBadge>
            <span className="text-sm text-charcoal/50">
              {images.length} / 10 images
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-ink/5 text-charcoal/60 rounded-full">
              Order: {facility.display_order}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Upload Zone */}
        <div className="mb-8 p-6 border-2 border-dashed border-ink/20 rounded-xl bg-ink/3 transition hover:border-brass/30 hover:bg-ink/5">
          <input
            type="file"
            id="gallery-upload"
            name="gallery_images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={images.length >= 10 || uploading}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="gallery-upload"
            className="cursor-pointer w-full"
            style={{ cursor: images.length >= 10 ? "not-allowed" : "pointer" }}
          >
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-brass/50"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-lg font-medium text-ink mb-1">
                {images.length >= 10 ? "Maximum of 10 images reached" : "Add Gallery Images"}
              </p>
              <p className="text-sm text-charcoal/50">
                {images.length >= 10
                  ? "Maximum of 10 images reached. Delete an image to add more."
                  : `Drag & drop or click to upload • ${10 - images.length} slot${10 - images.length !== 1 ? "s" : ""} remaining • JPG, PNG, WebP`}
              </p>
              <p className="mt-2 text-xs text-charcoal/40">
                JPG, PNG, WebP • Max 10 images total per facility
              </p>
            </div>
          </label>
        </div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-ink/20 rounded-xl bg-ink/3">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-charcoal/30"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-lg font-medium text-charcoal/50 mb-1">No gallery images yet</p>
            <p className="text-sm text-charcoal/40">Upload images to build the facility gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e): void => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(index) as React.DragEventHandler<HTMLDivElement>}
                className="group relative bg-paper rounded-lg overflow-hidden border border-ink/10 hover:border-brass/30 transition"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || facility.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {image.is_cover && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink bg-brass/90 rounded">
                        COVER
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!image.is_cover && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(image.id);
                        }}
                        className="p-1.5 rounded-full bg-black/50 text-white hover:bg-brass transition text-[10px]"
                        title="Set as cover"
                        aria-label="Set as cover image"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2v20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-15.3-15.3A15.3 15.3 0 0 1 12 2z" stroke="currentColor" strokeWidth="2.5" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      disabled={deletingId === image.id}
                      className="p-1.5 rounded-full bg-black/50 text-white hover:bg-red-600 transition text-[10px]"
                      title="Delete image"
                      aria-label="Delete image"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-ink/3 border-t border-ink/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-charcoal/60">#{index + 1}</span>
                    <span className="text-charcoal/40">{format(new Date(image.created_at), "MMM d, yyyy")}</span>
                  </div>
                  {image.alt_text && (
                    <p className="mt-1 text-[11px] text-charcoal/50 truncate">{image.alt_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-4 rounded-lg bg-ink/3 border border-ink/10 text-sm text-charcoal/60">
          <p className="font-medium text-ink mb-2">Drag & Drop to Reorder</p>
          <ul className="space-y-1 text-xs">
            <li>• Drag images to reorder the gallery</li>
            <li>• Click the star icon to set as cover image</li>
            <li>• Cover image appears on facility cards and detail page</li>
            <li>• Maximum 10 images per facility</li>
          </ul>
        </div>
      </div>
    </div>
  );
}