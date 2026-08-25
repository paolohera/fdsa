"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-ui";
import { compressImage } from "@/lib/compress-image";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function ProgramImageForm({
  action,
  currentImageUrl,
  code,
}: {
  action: (formData: FormData) => void;
  currentImageUrl?: string | null;
  code: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [pending, startTransition] = useTransition();
  const { showToast, updateToast, dismissToast } = useAdminToast();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) return;

    setCompressing(true);
    const toastId = showToast(`Compressing ${code} image…`, "loading");

    const compressed = await compressImage(selectedFile);
    setCompressing(false);

    updateToast(toastId, `Uploading ${code} image…`, "loading");

    const formData = new FormData();
    formData.set("image", compressed);

    startTransition(() => {
      // updateProgramImage redirects on success, which unmounts this page —
      // there's no callback after that point to confirm completion from.
      // A same-page redirect back to /admin/programs with the new image
      // showing IS the visible confirmation, so swap the toast to a brief
      // success state now rather than leaving it stuck on "Uploading…"
      // forever once the redirect fires.
      action(formData);
      updateToast(toastId, `${code} image saved`, "success");
    });
  }

  const isBusy = compressing || pending;

  return (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink/5">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={code}
            className={`h-full w-full object-cover transition-opacity ${isBusy ? "opacity-50" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-charcoal/40">No image</span>
          </div>
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <Loader2 size={28} className="animate-spin text-parchment" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          disabled={isBusy}
          onChange={handleFileChange}
          className="text-xs text-charcoal/60 file:mr-2 file:border-0 file:bg-ink/5 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-ink/10 disabled:opacity-50"
        />
        <AdminButton
          type="submit"
          variant="secondary"
          disabled={!selectedFile || isBusy}
          className="justify-center gap-2 px-3 py-1.5 text-xs"
        >
          {isBusy && <Loader2 size={13} className="animate-spin" />}
          {compressing ? "Compressing…" : pending ? "Uploading…" : currentImageUrl ? "Replace" : "Upload"}
        </AdminButton>
      </form>
    </>
  );
}