import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NewsCard from "@/components/news-card";
import ScrollReveal from "@/components/scroll-reveal";
import { sortByPriority } from "@/lib/news-priority";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "Updates, announcements, and stories from around the FDSA campus at Mactan-Cebu International Airport.",
  alternates: { canonical: "/news" },
};

export const revalidate = 60;

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data: rawPosts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at, image_url, location, priority")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const posts = rawPosts ? sortByPriority(rawPosts) : rawPosts;

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/news-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        <ScrollReveal className="relative mx-auto max-w-3xl px-6 pt-28 pb-16 text-center sm:pt-32 sm:pb-20 lg:pt-40">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Chronicle
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            News
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
            Updates, announcements, and stories from around the FDSA campus.
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        {(!posts || posts.length === 0) && (
          <p className="text-sm text-charcoal/60">
            No news posted yet. Check back soon.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-flow-row-dense sm:grid-cols-3 sm:auto-rows-[220px]">
          {posts?.map((post) => (
            <NewsCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              body={post.body}
              createdAt={post.created_at}
              imageUrl={post.image_url}
              location={post.location}
              featured={post.priority === "featured"}
            />
          ))}
        </div>
      </section>
    </div>
  );
}