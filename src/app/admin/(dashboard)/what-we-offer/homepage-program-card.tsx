"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUp, ArrowDown, Save, Star, ImagePlus, Trash2 } from "lucide-react";
import { AdminCard, AdminButton, AdminBadge } from "@/components/admin/admin-ui";
import { compressImage } from "@/lib/compress-image";
import { useAdminToast } from "@/components/admin/admin-toast";
import ConfirmModal from "@/components/admin/confirm-modal";
import { MAX_PROGRAM_GALLERY_IMAGES, type ProgramGalleryImage } from "@/lib/homepage-gallery";

type HomepageProgram = {
  id: string;
  code: string;
  track: string;
  name: string;
  description: string;
  image_url: string | null;
  storage_path: string | null;
  link_href: string;
  sort_order: number;
  is_featured: boolean;
};

// Gallery photos for this card — separate from the single cover image
// above. Available on every card (not just the featured one) so admins can
// prep photos in advance before marking a card as featured.
function GallerySection({
  existingImages,
  addAction,
  deleteAction,
}: {
  existingImages: ProgramGalleryImage[];
  addAction: (formData: FormData) => Promise<void>;
  deleteAction: (imageId: string, storagePath: string) => Promise<void>;
}) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [isPending, startTransition] = useTransition();
  const [isCompressing, setIsCompressing] = useState(false);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_PROGRAM_GALLERY_IMAGES - existingImages.length - newFiles.length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || remainingSlots <= 0) return;
    const incoming = Array.from(fileList).slice(0, remainingSlots);

    setIsCompressing(true);
    try {
      const compressed = await Promise.all(incoming.map((file) => compressImage(file)));
      setNewFiles((prev) => [
        ...prev,
        ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) })),
      ]);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExisting = (img: ProgramGalleryImage) => {
    startTransition(async () => {
      try {
        await deleteAction(img.id, img.storage_path);
        router.refresh();
        showToast("Gallery image removed", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to remove image", "error");
      }
    });
  };

  const handleUpload = () => {
    if (newFiles.length === 0) return;
    const formData = new FormData();
    newFiles.forEach(({ file }) => formData.append("gallery", file));

    startTransition(async () => {
      try {
        await addAction(formData);
        router.refresh();
        showToast(`${newFiles.length} image${newFiles.length > 1 ? "s" : ""} added`, "success");
        newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
        setNewFiles([]);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to upload images", "error");
      }
    });
  };

  return (
    <div className="col-span-2 border-t border-ink/10 pt-4 sm:col-span-12">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink">Gallery</h4>
        <span className="text-[11px] text-charcoal/40">
          {existingImages.length + newFiles.length}/{MAX_PROGRAM_GALLERY_IMAGES}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-charcoal/40">
        Extra photos shown as carousel slides when this card is featured.
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {existingImages.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden border border-ink/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveExisting(img)}
              disabled={isPending}
              title="Remove"
              className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
            >
              <Trash2 size={13} className="text-parchment" />
            </button>
          </div>
        ))}

        {newFiles.map((f, i) => (
          <div
            key={f.preview}
            className="group relative aspect-square overflow-hidden border border-brass/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(i)}
              title="Remove"
              className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={13} className="text-parchment" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <label
            className={`flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-ink/20 text-charcoal/40 transition-colors ${
              isCompressing ? "cursor-wait opacity-60" : "cursor-pointer hover:border-brass/50"
            }`}
          >
            <ImagePlus size={16} />
            <span className="text-[9px]">{isCompressing ? "…" : "Add"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={isCompressing}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {newFiles.length > 0 && (
        <AdminButton
          type="button"
          disabled={isPending || isCompressing}
          onClick={handleUpload}
          className="mt-3 gap-2 px-3 py-1.5 text-xs"
        >
          {isPending && <Loader2 size={13} className="animate-spin" />}
          Upload {newFiles.length} image{newFiles.length > 1 ? "s" : ""}
        </AdminButton>
      )}
    </div>
  );
}

export default function HomepageProgramCard({
  item,
  isFirst,
  isLast,
  updateTextAction,
  updateImageAction,
  removeImageAction,
  deleteAction,
  moveUpAction,
  moveDownAction,
  toggleFeaturedAction,
  galleryImages,
  addGalleryAction,
  deleteGalleryImageAction,
}: {
  item: HomepageProgram;
  isFirst: boolean;
  isLast: boolean;
  updateTextAction: (formData: FormData) => Promise<void>;
  updateImageAction: (formData: FormData) => Promise<void>;
  removeImageAction: () => Promise<void>;
  deleteAction: () => Promise<void>;
  moveUpAction: () => Promise<void>;
  moveDownAction: () => Promise<void>;
  toggleFeaturedAction: () => Promise<void>;
  galleryImages: ProgramGalleryImage[];
  addGalleryAction: (formData: FormData) => Promise<void>;
  deleteGalleryImageAction: (imageId: string, storagePath: string) => Promise<void>;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(item.image_url);
  const [compressing, setCompressing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reordering, startReorder] = useTransition();
  const [togglingFeatured, startFeaturedToggle] = useTransition();
  const { showToast } = useAdminToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    let processed: File;
    try {
      processed = await compressImage(file);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't process that image", "error");
      setCompressing(false);
      e.target.value = "";
      return;
    }
    setCompressing(false);

    const previousPreview = preview;
    setPreview(URL.createObjectURL(processed));

    const formData = new FormData();
    formData.set("image", processed);

    startTransition(async () => {
      try {
        await updateImageAction(formData);
        router.refresh();
        showToast(`${item.code} image saved`, "success");
      } catch (err) {
        setPreview(previousPreview);
        showToast(err instanceof Error ? err.message : "Failed to save image — try again", "error");
      }
    });

    e.target.value = "";
  }

  function handleTextSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateTextAction(formData);
        router.refresh();
        showToast(`${item.code} details saved`, "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to save details", "error");
      }
    });
  }

  function handleRemoveImage() {
    startTransition(async () => {
      try {
        await removeImageAction();
        setPreview(null);
        router.refresh();
        showToast(`${item.code} image removed`, "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to remove image", "error");
      }
    });
  }

  function handleMove(direction: "up" | "down") {
    startReorder(async () => {
      try {
        await (direction === "up" ? moveUpAction() : moveDownAction());
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to reorder", "error");
      }
    });
  }

  function handleToggleFeatured() {
    startFeaturedToggle(async () => {
      try {
        await toggleFeaturedAction();
        router.refresh();
        showToast(
          item.is_featured ? `${item.code} unfeatured` : `${item.code} is now featured`,
          "success"
        );
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to update featured card", "error");
      }
    });
  }

  function handleDelete() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          await deleteAction();
          router.refresh();
          showToast(`${item.code} card deleted`, "success");
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Failed to delete card", "error");
        }
        resolve();
      });
    });
  }

  const isBusy = compressing || pending;

  return (
    <AdminCard
      className={`grid grid-cols-1 gap-6 p-5 sm:grid-cols-12 sm:items-start ${
        item.is_featured ? "ring-1 ring-brass" : ""
      }`}
    >
      {/* Reorder */}
      <div className="flex flex-row gap-2 sm:col-span-1 sm:flex-col">
        <AdminButton
          type="button"
          variant="secondary"
          disabled={isFirst || reordering}
          onClick={() => handleMove("up")}
          className="justify-center px-2 py-1.5"
        >
          <ArrowUp size={14} />
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={isLast || reordering}
          onClick={() => handleMove("down")}
          className="justify-center px-2 py-1.5"
        >
          <ArrowDown size={14} />
        </AdminButton>
      </div>

      {/* Image */}
      <div className="sm:col-span-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={item.name}
              className={`h-full w-full object-cover transition-opacity ${isBusy ? "opacity-50" : ""}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-charcoal/40">No image</span>
            </div>
          )}
          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
              <Loader2 size={24} className="animate-spin text-parchment" />
            </div>
          )}
          {item.is_featured && (
            <div className="absolute left-2 top-2">
              <AdminBadge tone="brass">
                <Star size={11} className="mr-1 inline fill-current" />
                Featured
              </AdminBadge>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            disabled={isBusy}
            onChange={handleFileChange}
            className="text-xs text-charcoal/60 file:mr-2 file:border-0 file:bg-ink/5 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-ink/10 disabled:opacity-50"
          />
          <p className="text-[11px] text-charcoal/40">
            {compressing ? "Processing…" : pending ? "Saving…" : "Choosing a file saves it immediately."}
          </p>
          {item.image_url && (
            <AdminButton
              type="button"
              variant="danger"
              disabled={isBusy}
              onClick={handleRemoveImage}
              className="justify-center gap-2 px-3 py-1.5 text-xs"
            >
              Remove image
            </AdminButton>
          )}
        </div>
      </div>

      {/* Text fields */}
      <form onSubmit={handleTextSubmit} className="grid grid-cols-1 gap-2 sm:col-span-8 sm:grid-cols-2">
        <input
          name="code"
          defaultValue={item.code}
          placeholder="Code (e.g. BAMT)"
          required
          className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
        <input
          name="track"
          defaultValue={item.track}
          placeholder="Track (e.g. Baccalaureate)"
          required
          className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
        <input
          name="name"
          defaultValue={item.name}
          placeholder="Full program name"
          required
          className="col-span-2 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
        <textarea
          name="description"
          defaultValue={item.description}
          placeholder="Description"
          required
          rows={3}
          className="col-span-2 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
        <input
          name="link_href"
          defaultValue={item.link_href}
          placeholder="Learn more link (e.g. /programs)"
          className="col-span-2 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />

        <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <AdminButton type="submit" disabled={pending} className="gap-2 px-3 py-1.5 text-xs">
              {pending && <Loader2 size={13} className="animate-spin" />}
              <Save size={13} />
              Save details
            </AdminButton>

            <AdminButton
              type="button"
              variant={item.is_featured ? "primary" : "secondary"}
              disabled={togglingFeatured}
              onClick={handleToggleFeatured}
              className="gap-2 px-3 py-1.5 text-xs"
              title={item.is_featured ? "Unfeature this card" : "Feature this card — shows as the big carousel"}
            >
              {togglingFeatured ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Star size={13} className={item.is_featured ? "fill-current" : ""} />
              )}
              {item.is_featured ? "Featured" : "Feature"}
            </AdminButton>
          </div>

          <ConfirmModal
            title={`Delete ${item.code} card?`}
            description="This removes the card, its image, and its gallery photos from the homepage entirely. This can't be undone."
            confirmLabel="Delete"
            variant="danger"
            onConfirm={handleDelete}
            trigger={
              <AdminButton
                type="button"
                variant="danger"
                disabled={pending}
                className="!border !border-red-200 !text-red-600 hover:!bg-red-50 px-3 py-1.5 text-xs"
              >
                Delete card
              </AdminButton>
            }
          />
        </div>
      </form>

      <GallerySection
        existingImages={galleryImages}
        addAction={addGalleryAction}
        deleteAction={deleteGalleryImageAction}
      />
    </AdminCard>
  );
}