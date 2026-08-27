"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_GALLERY_IMAGES } from "@/lib/news-gallery";

const VALID_PRIORITIES = ["normal", "featured", "pinned"] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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

function getGalleryFiles(formData: FormData): File[] {
  return formData
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

type GalleryRow = {
  post_id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
};

type UploadResult = { row: GalleryRow } | { error: { message: string } };

// Uploads gallery files in parallel (fast, no waterfall) and inserts one row
// per successful upload. Returns any per-file errors so the caller can
// decide whether to surface them without blocking the whole save.
async function uploadGalleryImages(
  supabase: SupabaseServerClient,
  postId: string,
  files: File[],
  startOrder: number
) {
  const results: UploadResult[] = await Promise.all(
    files.map(async (file, i): Promise<UploadResult> => {
      const path = `gallery/${postId}/${randomFileName(file.name)}`;
      const { error } = await supabase.storage.from("news-images").upload(path, file);
      if (error) return { error };

      const {
        data: { publicUrl },
      } = supabase.storage.from("news-images").getPublicUrl(path);

      return {
        row: {
          post_id: postId,
          image_url: publicUrl,
          storage_path: path,
          sort_order: startOrder + i,
        },
      };
    })
  );

  const rows = results
    .filter((r): r is { row: GalleryRow } => "row" in r)
    .map((r) => r.row);
  const errors = results.filter((r): r is { error: { message: string } } => "error" in r);

  if (rows.length > 0) {
    await supabase.from("news_post_images").insert(rows);
  }

  return errors;
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

  const { data: inserted, error } = await supabase
    .from("news_posts")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !inserted) {
    redirect(`/admin/news/new?error=${encodeURIComponent(error?.message ?? "Could not create post")}`);
  }

  const galleryFiles = getGalleryFiles(formData).slice(0, MAX_GALLERY_IMAGES);
  if (galleryFiles.length > 0) {
    await uploadGalleryImages(supabase, inserted.id, galleryFiles, 0);
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

  const galleryFiles = getGalleryFiles(formData);
  if (galleryFiles.length > 0) {
    const { count } = await supabase
      .from("news_post_images")
      .select("id", { count: "exact", head: true })
      .eq("post_id", id);

    const remaining = MAX_GALLERY_IMAGES - (count ?? 0);
    if (remaining > 0) {
      await uploadGalleryImages(supabase, id, galleryFiles.slice(0, remaining), count ?? 0);
    }
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

// Removes a single gallery image — called from a per-thumbnail form on the
// edit page, so admins don't have to resave the whole post to drop one image.
export async function deleteGalleryImage(imageId: string, postId: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("news-images").remove([storagePath]);
  await supabase.from("news_post_images").delete().eq("id", imageId);

  revalidatePath(`/admin/news/${postId}`);
  revalidatePath("/news");
}

export async function deletePost(id: string) {
  const supabase = await createClient();

  const [{ data: existing }, { data: galleryImages }] = await Promise.all([
    supabase.from("news_posts").select("storage_path").eq("id", id).maybeSingle(),
    supabase.from("news_post_images").select("storage_path").eq("post_id", id),
  ]);

  const pathsToRemove = [
    ...(existing?.storage_path ? [existing.storage_path] : []),
    ...(galleryImages ?? []).map((g) => g.storage_path),
  ];

  if (pathsToRemove.length > 0) {
    await supabase.storage.from("news-images").remove(pathsToRemove);
  }

  // news_post_images rows are removed automatically via the FK's
  // `on delete cascade`.
  await supabase.from("news_posts").delete().eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/news");
}