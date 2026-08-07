"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

// ---------- Slides ----------

export async function createSlide(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) ?? "";
  const ctaLabel = (formData.get("cta_label") as string) || "Enroll Now";
  const ctaUrl = (formData.get("cta_url") as string) || "/programs";

  if (!file || file.size === 0) {
    redirect("/admin/hero/new?error=Please choose an image file.");
  }
  if (!title) {
    redirect("/admin/hero/new?error=Please enter a title.");
  }

  const path = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("hero-images")
    .upload(path, file);

  if (uploadError) {
    redirect(`/admin/hero/new?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hero-images").getPublicUrl(path);

  const { data: maxRow } = await supabase
    .from("hero_slides")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxRow?.position ?? -1) + 1;

  const { data: inserted, error: insertError } = await supabase
    .from("hero_slides")
    .insert({
      image_url: publicUrl,
      storage_path: path,
      title,
      description,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    redirect(
      `/admin/hero/new?error=${encodeURIComponent(insertError?.message ?? "Could not create slide.")}`
    );
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
  redirect(`/admin/hero/${inserted.id}`);
}

export async function updateSlideDetails(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) ?? "";
  const ctaLabel = (formData.get("cta_label") as string) || "Enroll Now";
  const ctaUrl = (formData.get("cta_url") as string) || "/programs";

  const { error } = await supabase
    .from("hero_slides")
    .update({ title, description, cta_label: ctaLabel, cta_url: ctaUrl })
    .eq("id", id);

  if (error) {
    redirect(`/admin/hero/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/hero/${id}`);
  revalidatePath("/");
  redirect(`/admin/hero/${id}`);
}

export async function replaceSlideImage(
  id: string,
  oldStoragePath: string,
  formData: FormData
) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    redirect(`/admin/hero/${id}?error=Please choose a replacement image.`);
  }

  const newPath = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("hero-images")
    .upload(newPath, file);

  if (uploadError) {
    redirect(`/admin/hero/${id}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("hero-images").getPublicUrl(newPath);

  const { error: updateError } = await supabase
    .from("hero_slides")
    .update({ image_url: publicUrl, storage_path: newPath })
    .eq("id", id);

  if (updateError) {
    redirect(`/admin/hero/${id}?error=${encodeURIComponent(updateError.message)}`);
  }

  await supabase.storage.from("hero-images").remove([oldStoragePath]);

  revalidatePath(`/admin/hero/${id}`);
  revalidatePath("/");
  redirect(`/admin/hero/${id}`);
}

export async function deleteSlide(id: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("hero-images").remove([storagePath]);
  await supabase.from("hero_slides").delete().eq("id", id);
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function moveSlide(id: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: slides } = await supabase
    .from("hero_slides")
    .select("id, position")
    .order("position", { ascending: true });

  if (!slides) return;

  const index = slides.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= slides.length) return;

  const current = slides[index];
  const swap = slides[swapIndex];

  await supabase.from("hero_slides").update({ position: swap.position }).eq("id", current.id);
  await supabase.from("hero_slides").update({ position: current.position }).eq("id", swap.id);

  revalidatePath("/admin/hero");
  revalidatePath("/");
}

// ---------- Stats ----------

export async function addStat(slideId: string, formData: FormData) {
  const supabase = await createClient();

  const value = formData.get("value") as string;
  const label = formData.get("label") as string;

  if (!value || !label) {
    redirect(`/admin/hero/${slideId}?error=Please fill in both stat fields.`);
  }

  const { data: maxRow } = await supabase
    .from("hero_slide_stats")
    .select("position")
    .eq("slide_id", slideId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxRow?.position ?? -1) + 1;

  const { error } = await supabase.from("hero_slide_stats").insert({
    slide_id: slideId,
    value,
    label,
    position: nextPosition,
  });

  if (error) {
    redirect(`/admin/hero/${slideId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/hero/${slideId}`);
  revalidatePath("/");
  redirect(`/admin/hero/${slideId}`);
}

export async function updateStat(slideId: string, statId: string, formData: FormData) {
  const supabase = await createClient();

  const value = formData.get("value") as string;
  const label = formData.get("label") as string;

  const { error } = await supabase
    .from("hero_slide_stats")
    .update({ value, label })
    .eq("id", statId);

  if (error) {
    redirect(`/admin/hero/${slideId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/hero/${slideId}`);
  revalidatePath("/");
  redirect(`/admin/hero/${slideId}`);
}

export async function deleteStat(slideId: string, statId: string) {
  const supabase = await createClient();
  await supabase.from("hero_slide_stats").delete().eq("id", statId);
  revalidatePath(`/admin/hero/${slideId}`);
  revalidatePath("/");
}

export async function moveStat(slideId: string, statId: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("hero_slide_stats")
    .select("id, position")
    .eq("slide_id", slideId)
    .order("position", { ascending: true });

  if (!stats) return;

  const index = stats.findIndex((s) => s.id === statId);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= stats.length) return;

  const current = stats[index];
  const swap = stats[swapIndex];

  await supabase.from("hero_slide_stats").update({ position: swap.position }).eq("id", current.id);
  await supabase.from("hero_slide_stats").update({ position: current.position }).eq("id", swap.id);

  revalidatePath(`/admin/hero/${slideId}`);
  revalidatePath("/");
}