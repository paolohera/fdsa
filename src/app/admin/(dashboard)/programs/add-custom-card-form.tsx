"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";
import { compressImage } from "@/lib/compress-image";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function AddCustomCardForm({
  action,
  remainingSlots,
}: {
  action: (formData: FormData) => Promise<void>;
  remainingSlots: number;
}) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  if (remainingSlots <= 0) {
    return (
      <AdminCard className="flex flex-col items-center justify-center p-5 text-center">
        <p className="text-sm text-charcoal/50">
          Maximum of 10 program cards reached. Delete a custom card to add another.
        </p>
      </AdminCard>
    );
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

    const toastId = showToast("Adding card…", "loading");
    startTransition(() => {
      action(formData);
      showToast("Card added", "success");
    });
    form.reset();
  }

  return (
    <AdminCard className="flex flex-col justify-center gap-3 border-dashed p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Plus size={16} className="text-brass" />
        Add a program card
      </div>
      <p className="text-xs text-charcoal/50">{remainingSlots} slot(s) remaining out of 10.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          name="code"
          placeholder="Code (e.g. AVMT)"
          required
          maxLength={10}
          className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
        <input
          type="text"
          name="label"
          placeholder="Full name"
          required
          className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          className="text-xs text-charcoal/60 file:mr-2 file:border-0 file:bg-ink/5 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-ink/10"
        />
        <AdminButton type="submit" disabled={pending} className="justify-center gap-2 px-3 py-1.5 text-xs">
          {pending && <Loader2 size={13} className="animate-spin" />}
          {pending ? "Adding…" : "Add card"}
        </AdminButton>
      </form>
    </AdminCard>
  );
}