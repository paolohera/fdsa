import { createClient } from "@/lib/supabase/server";
import NewsCard from "@/components/news-card";

export const revalidate = 60;

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at, image_url")
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

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <NewsCard
            key={post.id}
            slug={post.slug}
            title={post.title}
            body={post.body}
            createdAt={post.created_at}
            imageUrl={post.image_url}
          />
        ))}
      </div>
    </div>
  );
}