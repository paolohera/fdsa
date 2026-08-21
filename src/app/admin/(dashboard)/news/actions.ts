"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_PRIORITIES = ["normal", "featured", "pinned"] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

function normalizePriority(value: FormDataEntryValue | null): Priority {
  return VALID_PRIORITIES.includes(value as Priority) ? (value as Priority) : "normal";
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

function parseLocalDatetime(value: FormDataEntryValue | null): string | undefined {
  if (!value || typeof value !== "string" || value.trim() === "") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const location = (formData.get("location") as string) || null;
  const published = formData.get("published") === "on";
  const priority = normalizePriority(formData.get("priority"));
  const imageFile = formData.get("image") as File | null;
  const createdAt = parseLocalDatetime(formData.get("created_at"));

  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const path = randomFileName(imageFile.name);
    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(path, imageFile);

    if (uploadError) {
      redirect(`/admin/news/new?error=${encodeURIComponent(uploadError.message)}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("news-images").getPublicUrl(path);

    imageUrl = publicUrl;
    storagePath = path;
  }

  const { error } = await supabase.from("news_posts").insert({
    title,
    slug: slugify(title),
    body,
    location,
    published,
    priority,
    author_id: user?.id,
    image_url: imageUrl,
    storage_path: storagePath,
    ...(createdAt ? { created_at: createdAt } : {}),
  });

  if (error) {
    redirect(`/admin/news/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const location = (formData.get("location") as string) || null;
  const published = formData.get("published") === "on";
  const priority = normalizePriority(formData.get("priority"));
  const imageFile = formData.get("image") as File | null;
  const createdAt = parseLocalDatetime(formData.get("created_at"));

  const updates: Record<string, unknown> = {
    title,
    slug: slugify(title),
    body,
    location,
    published,
    priority,
  };

  if (createdAt) {
    updates.created_at = createdAt;
  }

  if (imageFile && imageFile.size > 0) {
    const { data: existing } = await supabase
      .from("news_posts")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    const path = randomFileName(imageFile.name);
    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(path, imageFile);

    if (uploadError) {
      redirect(`/admin/news/${id}?error=${encodeURIComponent(uploadError.message)}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("news-images").getPublicUrl(path);

    updates.image_url = publicUrl;
    updates.storage_path = path;

    if (existing?.storage_path) {
      await supabase.storage.from("news-images").remove([existing.storage_path]);
    }
  }

  const { error } = await supabase.from("news_posts").update(updates).eq("id", id);

  if (error) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/news");
  redirect("/admin/news");
}

// Quick pin/feature toggle used directly from the news list row — no need
// to open the full edit form just to change priority.
export async function setPostPriority(id: string, priority: Priority) {
  const supabase = await createClient();
  await supabase
    .from("news_posts")
    .update({ priority: VALID_PRIORITIES.includes(priority) ? priority : "normal" })
    .eq("id", id);

  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/news");
}

export async function removePostImage(id: string, storagePath: string | null) {
  const supabase = await createClient();
  if (storagePath) {
    await supabase.storage.from("news-images").remove([storagePath]);
  }
  await supabase
    .from("news_posts")
    .update({ image_url: null, storage_path: null })
    .eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/news");
}

export async function deletePost(id: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("news_posts")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage.from("news-images").remove([existing.storage_path]);
  }

  await supabase.from("news_posts").delete().eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/news");
}