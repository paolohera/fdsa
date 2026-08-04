    import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("news_posts")
    .select("title, body, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/news" className="text-sm text-brass hover:underline">
        &larr; Back to news
      </Link>

      <p className="mt-6 text-xs uppercase tracking-wide text-brass">
        {new Date(post.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1
        className="mt-2 text-4xl leading-tight text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {post.title}
      </h1>

      <div className="mt-8 whitespace-pre-wrap text-base leading-7 text-charcoal">
        {post.body}
      </div>
    </article>
  );
}