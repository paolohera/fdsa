import { createClient } from "@/lib/supabase/server";
import NewsCard from "@/components/news-card";
import ScrollReveal from "@/components/scroll-reveal";

export const revalidate = 60;

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at, image_url, location")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        {/* Background photo — swap the path below for a relevant campus/event photo. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/news-hero.jpg)" }}
        />
        {/* Navy/brand overlay so parchment text stays legible over any photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        {/* pt-* clears the fixed header (h-14 mobile / h-16 md / h-[80px] lg,
            plus the 2px brass border) with room to spare so the heading
            never sits under the nav bar or the overlapping crest. */}
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
          {posts?.map((post, index) => (
            <NewsCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              body={post.body}
              createdAt={post.created_at}
              imageUrl={post.image_url}
              location={post.location}
              featured={index % 3 === 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}