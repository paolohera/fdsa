"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function uploadHeroImage(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    redirect("/admin/hero?error=Please choose an image file.");
  }

  const path = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("hero-images")
    .upload(path, file);

  if (uploadError) {
    redirect(`/admin/hero?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hero-images").getPublicUrl(path);

  const { data: maxRow } = await supabase
    .from("hero_images")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxRow?.position ?? -1) + 1;

  const { error: insertError } = await supabase.from("hero_images").insert({
    image_url: publicUrl,
    storage_path: path,
    position: nextPosition,
  });

  if (insertError) {
    redirect(`/admin/hero?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
  redirect("/admin/hero");
}

export async function replaceHeroImage(
  id: string,
  oldStoragePath: string,
  formData: FormData
) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    redirect("/admin/hero?error=Please choose a replacement image.");
  }

  const newPath = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("hero-images")
    .upload(newPath, file);

  if (uploadError) {
    redirect(`/admin/hero?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hero-images").getPublicUrl(newPath);

  const { error: updateError } = await supabase
    .from("hero_images")
    .update({ image_url: publicUrl, storage_path: newPath })
    .eq("id", id);

  if (updateError) {
    redirect(`/admin/hero?error=${encodeURIComponent(updateError.message)}`);
  }

  // Best-effort cleanup of the old file — don't block on failure.
  await supabase.storage.from("hero-images").remove([oldStoragePath]);

  revalidatePath("/admin/hero");
  revalidatePath("/");
  redirect("/admin/hero");
}

export async function deleteHeroImage(id: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("hero-images").remove([storagePath]);
  await supabase.from("hero_images").delete().eq("id", id);
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function moveHeroImage(id: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("hero_images")
    .select("id, position")
    .order("position", { ascending: true });

  if (!images) return;

  const index = images.findIndex((img) => img.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= images.length) return;

  const current = images[index];
  const swap = images[swapIndex];

  await supabase.from("hero_images").update({ position: swap.position }).eq("id", current.id);
  await supabase.from("hero_images").update({ position: current.position }).eq("id", swap.id);

  revalidatePath("/admin/hero");
  revalidatePath("/");
}