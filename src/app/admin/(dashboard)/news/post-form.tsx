"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, MapPin, Pin, Star, Trash2 } from "lucide-react";
import { AdminCard, AdminButton, AdminBadge } from "@/components/admin/admin-ui";
import { deleteGalleryImage } from "./actions";
import { MAX_GALLERY_IMAGES, type GalleryImage } from "@/lib/news-gallery";
import { compressImage } from "@/lib/compress-image";

type Priority = "normal" | "featured" | "pinned";

type PostFormProps = {
  action: (formData: FormData) => void;
  postId?: string;
  galleryImages?: GalleryImage[];
  defaultValues?: {
    title: string;
    body: string;
    published: boolean;
    priority?: Priority | null;
    image_url?: string | null;
    location?: string | null;
    created_at?: string | null;
  };
  error?: string;
};

const EXCERPT_TARGET = 200;

function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; description: string }[] = [
  { value: "normal", label: "Normal", description: "Standard post, sorted by date." },
  { value: "featured", label: "Featured", description: "Shows on the homepage hero." },
  { value: "pinned", label: "Pinned", description: "Stays at the top of the news list." },
];

// Gallery images (up to MAX_GALLERY_IMAGES) — separate from the single
// featured/cover image above. Already-saved images show a remove button
// wired straight to the deleteGalleryImage server action; newly picked
// files stay as local previews until the form is submitted.
function GallerySection({
  postId,
  existingImages,
}: {
  postId?: string;
  existingImages: GalleryImage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_GALLERY_IMAGES - existingImages.length - newFiles.length;

  const handleRemoveExisting = (img: GalleryImage) => {
    if (!postId) return;
    startTransition(async () => {
      await deleteGalleryImage(img.id, postId, img.storage_path);
      router.refresh();
    });
  };

  const [isCompressing, setIsCompressing] = useState(false);

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

  // Keep a hidden `name="gallery"` file input in sync with newFiles via
  // DataTransfer, so removing a staged preview before saving actually
  // removes it from what gets submitted.
  useEffect(() => {
    const dt = new DataTransfer();
    newFiles.forEach(({ file }) => dt.items.add(file));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }, [newFiles]);

  return (
    <AdminCard className="p-5">
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
          Gallery images
        </h3>
        <span className="text-xs text-charcoal/40">
          {existingImages.length + newFiles.length}/{MAX_GALLERY_IMAGES}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {existingImages.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden border border-ink/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveExisting(img)}
              disabled={isPending}
              title="Remove image"
              className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
            >
              <Trash2 size={14} className="text-parchment" />
            </button>
          </div>
        ))}

        {newFiles.map((f, i) => (
          <div
            key={f.preview}
            className="group relative aspect-square overflow-hidden border border-ink/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(i)}
              title="Remove"
              className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={14} className="text-parchment" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <label
            className={`flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-ink/20 text-charcoal/40 transition-colors ${
              isCompressing ? "cursor-wait opacity-60" : "cursor-pointer hover:border-brass/50"
            }`}
          >
            <ImagePlus size={18} />
            <span className="text-[10px]">{isCompressing ? "Processing…" : "Add"}</span>
            <input
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

      {/* Actual field submitted with the form. Hidden — kept in sync above. */}
      <input ref={fileInputRef} type="file" name="gallery" multiple className="sr-only" readOnly />

      <p className="mt-2 text-xs text-charcoal/40">
        Up to {MAX_GALLERY_IMAGES} images. Shown as a gallery on the news post.
      </p>
    </AdminCard>
  );
}

export default function PostForm({
  action,
  postId,
  galleryImages = [],
  defaultValues,
  error,
}: PostFormProps) {
  const [body, setBody] = useState(defaultValues?.body ?? "");
  const [published, setPublished] = useState(defaultValues?.published ?? false);
  const [priority, setPriority] = useState<Priority>(defaultValues?.priority ?? "normal");
  const [preview, setPreview] = useState<string | null>(defaultValues?.image_url ?? null);
  const [coverCompressing, setCoverCompressing] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPreview(URL.createObjectURL(compressed));

      // Swap the compressed file back into the actual input so it's what
      // gets submitted, since we can't reassign e.target.files directly.
      const dt = new DataTransfer();
      dt.items.add(compressed);
      if (coverInputRef.current) coverInputRef.current.files = dt.files;
    } finally {
      setCoverCompressing(false);
    }
  };

  return (
    <form action={action}>
      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <AdminCard className="p-6">
            <input
              name="title"
              type="text"
              required
              placeholder="Post title"
              defaultValue={defaultValues?.title}
              className="w-full border-0 border-b border-ink/10 pb-3 text-2xl text-ink outline-none placeholder:text-charcoal/30 focus:border-brass"
              style={{ fontFamily: "var(--font-display)" }}
            />

            <div className="mt-4 flex items-center gap-2 text-charcoal/50">
              <MapPin size={15} className="shrink-0" />
              <input
                name="location"
                type="text"
                placeholder="Location — e.g. FDSA Campus, Lapu-Lapu City"
                defaultValue={defaultValues?.location ?? ""}
                className="w-full border-0 py-1 text-sm text-ink outline-none placeholder:text-charcoal/40"
              />
            </div>

            <textarea
              name="body"
              rows={16}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the post body…"
              className="mt-5 w-full resize-y border-t border-ink/10 pt-5 text-sm leading-6 text-ink outline-none placeholder:text-charcoal/30"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-charcoal/40">
              <span>The first ~140–200 characters show as the excerpt on news cards.</span>
              <span className={body.length > EXCERPT_TARGET ? "text-brass" : ""}>
                {body.length} chars
              </span>
            </div>
          </AdminCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <AdminCard className="p-5">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
                Publish
              </h3>
              <AdminBadge tone={published ? "green" : "slate"}>
                {published ? "Published" : "Draft"}
              </AdminBadge>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between">
              <span className="text-sm text-ink">Visible to the public</span>
              <span className="relative inline-flex items-center">
                <input
                  name="published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-ink/15 transition-colors peer-checked:bg-brass" />
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-ink">Post date &amp; time</span>
              <input
                name="created_at"
                type="datetime-local"
                defaultValue={toDatetimeLocal(defaultValues?.created_at)}
                className="mt-1.5 w-full rounded-md border border-ink/15 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brass"
              />
              <span className="mt-1 block text-xs text-charcoal/40">
                Controls the date shown on the post and its sort order.
              </span>
            </label>

            <AdminButton type="submit" className="mt-5 w-full justify-center">
              Save
            </AdminButton>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="border-b border-ink/10 pb-3 text-sm font-semibold uppercase tracking-wide text-ink">
              Priority
            </h3>
            <div className="mt-4 space-y-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 border p-3 transition ${
                    priority === opt.value
                      ? "border-brass bg-brass/5"
                      : "border-ink/10 hover:border-ink/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={opt.value}
                    checked={priority === opt.value}
                    onChange={() => setPriority(opt.value)}
                    className="mt-0.5 accent-brass"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      {opt.value === "pinned" && <Pin size={13} className="text-brass" />}
                      {opt.value === "featured" && <Star size={13} className="text-brass" />}
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-charcoal/50">
                      {opt.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="border-b border-ink/10 pb-3 text-sm font-semibold uppercase tracking-wide text-ink">
              Featured image
            </h3>

            <label className={`mt-4 block ${coverCompressing ? "cursor-wait" : "cursor-pointer"}`}>
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
                  {coverCompressing ? "Processing…" : preview ? "Replace image" : "Choose file"}
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                name="image"
                accept="image/*"
                disabled={coverCompressing}
                className="sr-only"
                onChange={handleCoverChange}
              />
            </label>
            <p className="mt-2 text-xs text-charcoal/40">
              Shown on news cards. Optional — leave blank for a text-only card.
            </p>
          </AdminCard>

          <GallerySection postId={postId} existingImages={galleryImages} />
        </div>
      </div>
    </form>
  );
}