import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // re-check for new published posts every 60s

export default async function HomePage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admissions open for Fall 2027
          </p>
          <h2
            className="mt-4 text-4xl leading-tight text-ink sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A century-old tradition of independent thought.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-charcoal/80">
            Ashford brings together six schools, forty research centers, and a
            student body of twelve thousand drawn from every corner of the
            state — and beyond.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/news"
              className="rounded-none border border-ink bg-ink px-6 py-3 text-sm font-medium text-parchment transition hover:bg-transparent hover:text-ink"
            >
              Read the latest
            </Link>
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-baseline justify-between border-b border-ink/20 pb-3">
          <h3
            className="text-2xl text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Latest News
          </h3>
          <Link href="/news" className="text-sm text-brass hover:underline">
            View all &rarr;
          </Link>
        </div>

        {(!posts || posts.length === 0) && (
          <p className="mt-8 text-sm text-charcoal/60">
            No news posted yet. Check back soon.
          </p>
        )}

        <div className="mt-2 divide-y divide-ink/10">
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
              <h4
                className="mt-1 text-xl text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {post.title}
              </h4>
              <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">
                {post.body}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}