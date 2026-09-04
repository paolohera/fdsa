"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function updateHeroImage(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Please choose an image file.");
  }

  const { data: existing } = await supabase
    .from("hero_image")
    .select("id, storage_path")
    .maybeSingle();

  const path = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("hero-image")
    .upload(path, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hero-image").getPublicUrl(path);

  if (existing) {
    const { error: updateError } = await supabase
      .from("hero_image")
      .update({ image_url: publicUrl, storage_path: path, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (existing.storage_path) {
      await supabase.storage.from("hero-image").remove([existing.storage_path]);
    }
  } else {
    const { error: insertError } = await supabase
      .from("hero_image")
      .insert({ image_url: publicUrl, storage_path: path });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
}