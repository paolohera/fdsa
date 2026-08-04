import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p
        className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
        style={{ fontFamily: "var(--font-display)" }}
      >
        The Chronicle
      </p>
      <h2
        className="mt-2 text-4xl text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        News
      </h2>

      {(!posts || posts.length === 0) && (
        <p className="mt-8 text-sm text-charcoal/60">
          No news posted yet. Check back soon.
        </p>
      )}

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/20">
        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            className="block py-6 transition hover:bg-paper"
          >
            <p className="text-xs uppercase tracking-wide text-brass">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h3
              className="mt-1 text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">
              {post.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}