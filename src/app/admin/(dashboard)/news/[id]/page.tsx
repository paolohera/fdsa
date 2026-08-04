import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    .select("title, body, published")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Edit post</h1>
      <div className="mt-6">
        <PostForm action={updatePostWithId} defaultValues={post} error={error} />
      </div>
    </div>
  );
}
