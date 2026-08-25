"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function updateProgramImage(programCode: string, formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    redirect(`/admin/programs?error=Please choose an image file.`);
  }

  const { data: existing } = await supabase
    .from("program_images")
    .select("storage_path")
    .eq("program_code", programCode)
    .maybeSingle();

  const path = randomFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from("program-images")
    .upload(path, file);

  if (uploadError) {
    redirect(`/admin/programs?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("program-images").getPublicUrl(path);

  const { error: upsertError } = await supabase
    .from("program_images")
    .upsert(
      { program_code: programCode, image_url: publicUrl, storage_path: path, updated_at: new Date().toISOString() },
      { onConflict: "program_code" }
    );

  if (upsertError) {
    redirect(`/admin/programs?error=${encodeURIComponent(upsertError.message)}`);
  }

  if (existing?.storage_path) {
    await supabase.storage.from("program-images").remove([existing.storage_path]);
  }

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  redirect("/admin/programs");
}

export async function removeProgramImage(programCode: string, storagePath: string | null) {
  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("program-images").remove([storagePath]);
  }

  await supabase
    .from("program_images")
    .update({ image_url: null, storage_path: null })
    .eq("program_code", programCode);

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

const MAX_TOTAL_CARDS = 10;

export async function createCustomProgramCard(formData: FormData) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("program_images")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) >= MAX_TOTAL_CARDS) {
    redirect(`/admin/programs?error=Maximum of ${MAX_TOTAL_CARDS} cards reached.`);
  }

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const label = (formData.get("label") as string)?.trim();
  const file = formData.get("image") as File | null;

  if (!code || !label) {
    redirect("/admin/programs?error=Please enter a code and label.");
  }

  const { data: existing } = await supabase
    .from("program_images")
    .select("id")
    .eq("program_code", code)
    .maybeSingle();

  if (existing) {
    redirect(`/admin/programs?error=A card with code "${code}" already exists.`);
  }

  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  if (file && file.size > 0) {
    const path = randomFileName(file.name);
    const { error: uploadError } = await supabase.storage
      .from("program-images")
      .upload(path, file);

    if (uploadError) {
      redirect(`/admin/programs?error=${encodeURIComponent(uploadError.message)}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("program-images").getPublicUrl(path);

    imageUrl = publicUrl;
    storagePath = path;
  }

  const { error } = await supabase.from("program_images").insert({
    program_code: code,
    label,
    is_custom: true,
    image_url: imageUrl,
    storage_path: storagePath,
  });

  if (error) {
    redirect(`/admin/programs?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  redirect("/admin/programs");
}

export async function deleteCustomProgramCard(code: string, storagePath: string | null) {
  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("program-images").remove([storagePath]);
  }

  await supabase.from("program_images").delete().eq("program_code", code).eq("is_custom", true);

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}