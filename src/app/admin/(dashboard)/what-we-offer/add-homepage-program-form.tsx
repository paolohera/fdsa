"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";
import { compressImage } from "@/lib/compress-image";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function AddHomepageProgramForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const compressed = await compressImage(file);
      formData.set("image", compressed);
    }

    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        showToast("Card added", "success");
        form.reset();
        setPreview(null);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to add card", "error");
      }
    });
  }

  return (
    <AdminCard className="border-dashed p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Plus size={16} className="text-brass" />
        Add a new &ldquo;What We Offer&rdquo; card
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        {/* Image preview */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs uppercase tracking-widest text-charcoal/40">No image</span>
              </div>
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 w-full text-xs text-charcoal/60 file:mr-2 file:border-0 file:bg-ink/5 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-ink/10"
          />
        </div>

        {/* Text fields */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            name="code"
            placeholder="Code (e.g. BAMT)"
            required
            maxLength={10}
            className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          />
          <input
            name="track"
            placeholder="Track (e.g. Baccalaureate)"
            required
            className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          />
          <input
            name="name"
            placeholder="Full program name"
            required
            className="col-span-2 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            rows={3}
            className="col-span-2 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          />
          <input
            name="link_href"
            placeholder="Learn more link (defaults to /programs)"
            className="col-span-2 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          />
          <AdminButton
            type="submit"
            disabled={pending}
            className="col-span-2 justify-center gap-2 px-3 py-1.5 text-xs"
          >
            {pending && <Loader2 size={13} className="animate-spin" />}
            {pending ? "Adding…" : "Add card"}
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}