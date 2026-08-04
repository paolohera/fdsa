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

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const published = formData.get("published") === "on";

  const { error } = await supabase.from("news_posts").insert({
    title,
    slug: slugify(title),
    body,
    published,
    author_id: user?.id,
  });

  if (error) {
    redirect(`/admin/news/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const published = formData.get("published") === "on";

  const { error } = await supabase
    .from("news_posts")
    .update({ title, slug: slugify(title), body, published })
    .eq("id", id);

  if (error) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  await supabase.from("news_posts").delete().eq("id", id);
  revalidatePath("/admin/news");
}
