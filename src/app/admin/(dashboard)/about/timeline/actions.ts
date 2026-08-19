"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function createTimelineEntry(formData: FormData) {
  const supabase = await createClient();

  const year = formData.get("year") as string;
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const imageFile = formData.get("image") as File | null;

  const { data: maxRow } = await supabase
    .from("timeline_entries")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.sort_order ?? 0) + 1;

  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const path = randomFileName(imageFile.name);
    const { error: uploadError } = await supabase.storage
      .from("timeline-images")
      .upload(path, imageFile);

    if (uploadError) {
      redirect(`/admin/about/timeline/new?error=${encodeURIComponent(uploadError.message)}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("timeline-images").getPublicUrl(path);

    imageUrl = publicUrl;
    storagePath = path;
  }

  const { error } = await supabase.from("timeline_entries").insert({
    year,
    title,
    body,
    sort_order: nextOrder,
    image_url: imageUrl,
    storage_path: storagePath,
  });

  if (error) {
    redirect(`/admin/about/timeline/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/about/timeline");
  revalidatePath("/about");
  redirect("/admin/about/timeline");
}

export async function updateTimelineEntry(id: string, formData: FormData) {
  const supabase = await createClient();

  const year = formData.get("year") as string;
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const imageFile = formData.get("image") as File | null;

  const updates: Record<string, unknown> = { year, title, body };

  if (imageFile && imageFile.size > 0) {
    const { data: existing } = await supabase
      .from("timeline_entries")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    const path = randomFileName(imageFile.name);
    const { error: uploadError } = await supabase.storage
      .from("timeline-images")
      .upload(path, imageFile);

    if (uploadError) {
      redirect(`/admin/about/timeline/${id}?error=${encodeURIComponent(uploadError.message)}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("timeline-images").getPublicUrl(path);

    updates.image_url = publicUrl;
    updates.storage_path = path;

    if (existing?.storage_path) {
      await supabase.storage.from("timeline-images").remove([existing.storage_path]);
    }
  }

  const { error } = await supabase.from("timeline_entries").update(updates).eq("id", id);

  if (error) {
    redirect(`/admin/about/timeline/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/about/timeline");
  revalidatePath("/about");
  redirect("/admin/about/timeline");
}

export async function deleteTimelineEntry(id: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("timeline_entries")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage.from("timeline-images").remove([existing.storage_path]);
  }

  await supabase.from("timeline_entries").delete().eq("id", id);
  revalidatePath("/admin/about/timeline");
  revalidatePath("/about");
}

// Swaps sort_order with the neighboring entry in the given direction.
export async function moveTimelineEntry(id: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("timeline_entries")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!entries) return;

  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= entries.length) return;

  const current = entries[index];
  const swapWith = entries[swapIndex];

  await supabase
    .from("timeline_entries")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);

  await supabase
    .from("timeline_entries")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);

  revalidatePath("/admin/about/timeline");
  revalidatePath("/about");
}