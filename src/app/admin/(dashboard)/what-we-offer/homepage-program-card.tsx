"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUp, ArrowDown, Save, Star } from "lucide-react";
import { AdminCard, AdminButton, AdminBadge } from "@/components/admin/admin-ui";
import { compressImage } from "@/lib/compress-image";
import { useAdminToast } from "@/components/admin/admin-toast";
import ConfirmModal from "@/components/admin/confirm-modal";

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
              title={item.is_featured ? "Unfeature this card" : "Feature this card — shows first on the homepage"}
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
            description="This removes the card and its image from the homepage entirely. This can't be undone."
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
    </AdminCard>
  );
}