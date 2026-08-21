import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    .select("title, body, published, priority, image_url, location, created_at")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to news
      </Link>
      <PostForm action={updatePostWithId} defaultValues={post} error={error} />
    </div>
  );
} 