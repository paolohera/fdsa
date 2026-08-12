import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import PostForm from "../post-form";
import { updatePost } from "../actions";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("news_posts")
    .select("title, body, published, image_url")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, id);

  return (
    <div>
      <AdminPageHeader title="Edit post" />
      <PostForm action={updatePostWithId} defaultValues={post} error={error} />
    </div>
  );
}