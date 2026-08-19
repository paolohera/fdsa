"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function updateVisionMission(id: string, formData: FormData) {
  const supabase = await createClient();

  const heading = formData.get("heading") as string;
  const body = formData.get("body") as string;
  const imageFile = formData.get("image") as File | null;

  const updates: Record<string, unknown> = { heading, body };

  if (imageFile && imageFile.size > 0) {
    const { data: existing } = await supabase
      .from("vision_mission")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    const path = randomFileName(imageFile.name);
    const { error: uploadError } = await supabase.storage
      .from("vision-mission-images")
      .upload(path, imageFile);

    if (uploadError) {
      redirect(`/admin/about/vision-mission?error=${encodeURIComponent(uploadError.message)}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("vision-mission-images").getPublicUrl(path);

    updates.image_url = publicUrl;
    updates.storage_path = path;

    if (existing?.storage_path) {
      await supabase.storage.from("vision-mission-images").remove([existing.storage_path]);
    }
  }

  const { error } = await supabase.from("vision_mission").update(updates).eq("id", id);

  if (error) {
    redirect(`/admin/about/vision-mission?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/about/vision-mission");
  revalidatePath("/about");
  redirect("/admin/about/vision-mission?saved=1");
}