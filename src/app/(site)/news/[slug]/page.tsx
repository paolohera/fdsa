import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
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
    .select("title, body, created_at, image_url, location")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  return (
    <article>
      {post.image_url && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-ink/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/news" className="text-sm text-brass hover:underline">
          &larr; Back to news
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-wide text-brass">
          <span>
            {new Date(post.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.location && (
            <span className="inline-flex items-center gap-1 normal-case tracking-normal text-charcoal/60">
              <MapPin size={13} className="shrink-0" />
              {post.location}
            </span>
          )}
        </div>

        <h1
          className="mt-2 text-4xl leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h1>

        <div className="mt-8 whitespace-pre-wrap text-base leading-7 text-charcoal">
          {post.body}
        </div>
      </div>
    </article>
  );
}