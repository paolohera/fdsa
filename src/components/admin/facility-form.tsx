"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, GripVertical, Trash2, Star } from "lucide-react";
import {
  uploadFacilityImage,
  deleteFacilityImage,
  setCoverImage,
  updateImageOrder,
  getFacilityImages,
  getFacility,
  deleteFacility,
  updateFacility,
  createFacility,
  type Facility,
  type FacilityImage,
} from "@/lib/facilities/actions";
import { AdminButton, AdminBadge, AdminCard } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";
import { format } from "date-fns";

const MAX_IMAGES = 10;
const placeholderBg = "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

interface FacilityFormProps {
  initialData?: any;
  initialImages?: any[];
  onSuccess?: () => void;
}

export function FacilityForm({ initialData, initialImages = [], onSuccess }: FacilityFormProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    short_description: initialData?.short_description || "",
    full_description: initialData?.full_description || "",
    cover_image: initialData?.cover_image || "",
    is_published: initialData?.is_published ?? true,
    display_order: initialData?.display_order || 0,
  });

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const isEditing = !!initialData?.id;
  const facilityId = initialData?.id;

  async function loadData() {
    try {
      if (!facilityId) return;
      const [facilityData, imagesData] = await Promise.all([
        getFacility(facilityId),
        getFacilityImages(facilityId),
      ]);
      if (!facilityData) {
        window.location.href = "/admin/facilities";
        return;
      }
      setFormData({
        title: facilityData.title || "",
        slug: facilityData.slug || "",
        short_description: facilityData.short_description || "",
        full_description: facilityData.full_description || "",
        cover_image: facilityData.cover_image || "",
        is_published: facilityData.is_published ?? true,
        display_order: facilityData.display_order || 0,
      });
      setImages(imagesData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(files: FileList) {
    const maxAllowed = 10 - images.length - pendingFiles.length;
    const filesToAdd = Array.from(files).slice(0, maxAllowed);

    if (filesToAdd.length === 0) {
      showToast("Maximum of 10 images per facility reached", "error");
      return;
    }

    if (isEditing && facilityId) {
      setUploading(true);
      setError(null);

      try {
        for (const file of filesToAdd) {
          await uploadFacilityImage(facilityId, file, null, images.length === 0 && pendingFiles.length === 0);
        }
        showToast(`${filesToAdd.length} image${filesToAdd.length > 1 ? "s" : ""} uploaded`, "success");
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    } else {
      setPendingFiles((prev) => [...prev, ...filesToAdd]);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image? This action cannot be undone.")) return;

    setDeletingId(imageId);
    try {
      await deleteFacilityImage(imageId, facilityId);
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
      await setCoverImage(facilityId, imageId);
      showToast("Cover image updated", "success");
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to set cover", "error");
    }
  }

  async function handleReorder(newImages: any[]) {
    try {
      const orders = newImages.map((img, index) => ({
        id: img.id,
        display_order: index,
      }));
      await updateImageOrder(facilityId, orders);
      setImages(newImages);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reorder", "error");
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    try {
      if (isEditing && facilityId) {
        await updateFacility(facilityId, fd);
        showToast("Facility updated", "success");
      } else {
        const newFacility = await createFacility(fd);
        showToast("Facility created", "success");
        
        // Upload pending images for new facility
        if (pendingFiles.length > 0) {
          setUploading(true);
          try {
            for (let i = 0; i < pendingFiles.length; i++) {
              await uploadFacilityImage(newFacility.id, pendingFiles[i], null, i === 0);
            }
            showToast(`${pendingFiles.length} image${pendingFiles.length > 1 ? "s" : ""} uploaded`, "success");
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Some images failed to upload", "error");
          } finally {
            setUploading(false);
          }
        }
        
        if (onSuccess) onSuccess();
        router.push(`/admin/facilities/${newFacility.id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (facilityId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [facilityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 text-brass" style={{ animation: "spin 1s linear infinite" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  const remainingSlots = 10 - images.length - pendingFiles.length;
  const allImages = [
    ...images.map((img, i) => ({ ...img, _index: i, _type: 'existing' as const })),
    ...pendingFiles.map((file, i) => ({
      id: `pending-${i}`,
      image_url: URL.createObjectURL(file),
      alt_text: file.name,
      is_cover: images.length === 0 && i === 0,
      _index: images.length + i,
      _type: 'pending' as const,
      _file: file,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input type="hidden" name="is_published" value={formData.is_published ? "true" : "false"} />
      <input type="hidden" name="display_order" value={formData.display_order} />
      <input type="hidden" name="cover_image" value={formData.cover_image} />

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Facility Information
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink mb-1">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={formData.title}
              required
              className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              placeholder="e.g., Aircraft Hangar"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              defaultValue={formData.slug}
              className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              placeholder="auto-generated from title"
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
              defaultValue={formData.short_description || ""}
              rows={3}
              className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              placeholder="Brief description shown on facility cards..."
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="full_description" className="block text-sm font-medium text-ink mb-1">
              Full Description
            </label>
            <textarea
              id="full_description"
              name="full_description"
              defaultValue={formData.full_description || ""}
              rows={5}
              className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              placeholder="Detailed description for the facility detail page..."
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={formData.is_published}
                value="true"
                className="w-4 h-4 rounded border-ink/20 text-brass focus:ring-brass focus:ring-2"
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              <span className="text-sm font-medium text-ink">Published</span>
            </label>
            <span className={`text-xs px-2 py-1 rounded-full ${formData.is_published ? "bg-emerald/10 text-emerald-700" : "bg-amber/10 text-amber-700"}`}>
              {formData.is_published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Gallery
        </h2>
        <p className="text-xs text-charcoal/50">
          Upload up to 10 images total. First image becomes the cover image.
        </p>

        <div className="mb-8 p-6 border-2 border-dashed border-ink/20 rounded-xl bg-ink/3 transition hover:border-brass/30 hover:bg-ink/5">
          <input
            type="file"
            id="gallery-upload"
            name="gallery_images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={remainingSlots <= 0 || uploading}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="gallery-upload"
            className="cursor-pointer w-full"
            style={{ cursor: remainingSlots <= 0 ? "not-allowed" : "pointer" }}
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
                {remainingSlots <= 0
                  ? "Maximum of 10 images reached. Delete an image to add more."
                  : `Drag & drop or click to upload • ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining • JPG, PNG, WebP`}
              </p>
              <p className="mt-2 text-xs text-charcoal/40">
                JPG, PNG, WebP • Max 10 images total per facility
              </p>
            </div>
          </label>
        </div>

        <div className="space-y-4">
          {allImages.length === 0 ? (
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
              <p className="mt-1 text-sm text-charcoal/40">Upload images to build the facility gallery</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {allImages.map((image, index) => (
                <div
                  key={image.id}
                  draggable={image._type === 'existing'}
                  onDragStart={(e) => image._type === 'existing' && handleDragStart(e, image._index)}
                  onDragOver={handleDragOver}
                  onDrop={image._type === 'existing' ? handleDrop(image._index) : undefined}
                  className="group relative bg-paper rounded-lg overflow-hidden border border-ink/10 hover:border-brass/30 transition"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || initialData?.title || "Facility"}
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
                      {image._type === 'existing' && !image.is_cover && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetCover(image.id);
                          }}
                          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-brass transition text-[10px]"
                          title="Set as cover"
                          aria-label="Set as cover image"
                        >
                          <Star size={12} strokeWidth={2.5} className="text-white" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (image._type === 'pending') {
                            setPendingFiles((prev) => prev.filter((_, i) => i !== image._index + images.length));
                          } else {
                            handleDelete(image.id);
                          }
                        }}
                        disabled={deletingId === image.id}
                        className="p-1.5 rounded-full bg-black/50 text-white hover:bg-red-600 transition text-[10px]"
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <Trash2 size={12} strokeWidth={2.5} className="text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2 bg-ink/3 border-t border-ink/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-charcoal/60">#{index + 1}</span>
                      <span className="text-charcoal/40">
                        {image._type === 'existing' 
                          ? format(new Date(image.created_at), "MMM d, yyyy")
                          : "Pending upload"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-ink/10">
        <Link
          href="/admin/facilities"
          className="px-4 py-2 text-sm font-medium text-charcoal/70 hover:text-ink transition border border-ink/20 rounded-lg hover:bg-ink/3"
        >
          Cancel
        </Link>
        <AdminButton type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? "Saving..." : isEditing ? "Update Facility" : "Create Facility"}
        </AdminButton>
      </div>
    </form>
  );
}