"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

// Adds the image if none exists yet, or replaces the existing one —
// this table only ever holds a single row.
export async function uploadAboutImage(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    redirect("/admin/about?error=Please choose an image file.");
  }

  const { data: existing } = await supabase
    .from("about_image")
    .select("id, storage_path")
    .maybeSingle();

  const path = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("about-images")
    .upload(path, file);

  if (uploadError) {
    redirect(`/admin/about?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("about-images").getPublicUrl(path);

  if (existing) {
    const { error: updateError } = await supabase
      .from("about_image")
      .update({ image_url: publicUrl, storage_path: path })
      .eq("id", existing.id);

    if (updateError) {
      redirect(`/admin/about?error=${encodeURIComponent(updateError.message)}`);
    }

    // Best-effort cleanup of the old file — don't block on failure.
    await supabase.storage.from("about-images").remove([existing.storage_path]);
  } else {
    const { error: insertError } = await supabase.from("about_image").insert({
      image_url: publicUrl,
      storage_path: path,
    });

    if (insertError) {
      redirect(`/admin/about?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath("/admin/about");
  revalidatePath("/");
  redirect("/admin/about");
}

export async function deleteAboutImage(id: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("about-images").remove([storagePath]);
  await supabase.from("about_image").delete().eq("id", id);
  revalidatePath("/admin/about");
  revalidatePath("/");
}