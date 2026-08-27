"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function createHomepageProgram(formData: FormData) {
  const supabase = await createClient();

  const code = (formData.get("code") as string)?.trim();
  const track = (formData.get("track") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const linkHref = (formData.get("link_href") as string)?.trim() || "/programs";
  const file = formData.get("image") as File | null;

  if (!code || !track || !name || !description) {
    throw new Error("Please fill in code, track, name, and description.");
  }

  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  if (file && file.size > 0) {
    const path = randomFileName(file.name);
    const { error: uploadError } = await supabase.storage.from("program-images").upload(path, file);
    if (uploadError) throw new Error(uploadError.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from("program-images").getPublicUrl(path);
    imageUrl = publicUrl;
    storagePath = path;
  }

  const { count } = await supabase
    .from("homepage_programs")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase.from("homepage_programs").insert({
    code,
    track,
    name,
    description,
    link_href: linkHref,
    image_url: imageUrl,
    storage_path: storagePath,
    sort_order: count ?? 0,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function updateHomepageProgram(id: string, formData: FormData) {
  const supabase = await createClient();

  const code = (formData.get("code") as string)?.trim();
  const track = (formData.get("track") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const linkHref = (formData.get("link_href") as string)?.trim() || "/programs";

  if (!code || !track || !name || !description) {
    throw new Error("Please fill in code, track, name, and description.");
  }

  const { error } = await supabase
    .from("homepage_programs")
    .update({ code, track, name, description, link_href: linkHref })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function updateHomepageProgramImage(id: string, formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Please choose an image file.");
  }

  const { data: existing } = await supabase
    .from("homepage_programs")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const path = randomFileName(file.name);
  const { error: uploadError } = await supabase.storage.from("program-images").upload(path, file);
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("program-images").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("homepage_programs")
    .update({ image_url: publicUrl, storage_path: path })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);

  if (existing?.storage_path) {
    await supabase.storage.from("program-images").remove([existing.storage_path]);
  }

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function removeHomepageProgramImage(id: string, storagePath: string | null) {
  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("program-images").remove([storagePath]);
  }

  const { error } = await supabase
    .from("homepage_programs")
    .update({ image_url: null, storage_path: null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function deleteHomepageProgram(id: string, storagePath: string | null) {
  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("program-images").remove([storagePath]);
  }

  const { error } = await supabase.from("homepage_programs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function moveHomepageProgram(id: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("homepage_programs")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!items) return;

  const index = items.findIndex((item) => item.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swap = items[swapIndex];

  const { error: e1 } = await supabase
    .from("homepage_programs")
    .update({ sort_order: swap.sort_order })
    .eq("id", current.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("homepage_programs")
    .update({ sort_order: current.sort_order })
    .eq("id", swap.id);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}