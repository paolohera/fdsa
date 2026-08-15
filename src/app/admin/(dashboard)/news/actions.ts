"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const location = (formData.get("location") as string) || null;
  const published = formData.get("published") === "on";
  const imageFile = formData.get("image") as File | null;

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
    author_id: user?.id,
    image_url: imageUrl,
    storage_path: storagePath,
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
  const imageFile = formData.get("image") as File | null;

  const updates: Record<string, unknown> = {
    title,
    slug: slugify(title),
    body,
    location,
    published,
  };

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