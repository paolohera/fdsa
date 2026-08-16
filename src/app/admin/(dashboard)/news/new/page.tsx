import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createPost } from "../actions";
import PostForm from "../post-form";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <Link
        href="/admin/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to news
      </Link>
      <PostForm action={createPost} error={error} />
    </div>
  );
}
