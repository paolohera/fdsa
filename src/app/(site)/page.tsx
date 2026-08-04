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
            CHED · TESDA · CAAP Recognized
          </p>
          <h2
            className="mt-4 text-4xl leading-tight text-ink sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A national leader in dependable, quality aviation education.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-charcoal/80">
            Since 1988, FDSA has trained aviation and aerospace professionals
            at Mactan-Cebu International Airport — combining flight and
            ground training with technical and degree programs recognized
            across the Philippine aviation industry.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/programs"
              className="rounded-none border border-ink bg-ink px-6 py-3 text-sm font-medium text-parchment transition hover:bg-transparent hover:text-ink"
            >
              Explore programs
            </Link>
            <Link
              href="/about"
              className="rounded-none border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
            >
              About FDSA
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

      {/* Find us */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-baseline justify-between border-b border-ink/20 pb-3">
            <h3
              className="text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Find Us
            </h3>
           <a href="https://www.google.com/maps/dir/?api=1&destination=10.2903054,123.9651446" 
           target="_blank" rel="noopener noreferrer" className="text-sm text-brass hover:underline">Get directions &rarr;</a>
          </div>

          <div className="mt-6 grid gap-8 sm:grid-cols-5">
            <div className="overflow-hidden border border-ink/15 sm:col-span-3">
              <iframe
                title="FDSA campus location"
                src="https://www.google.com/maps?q=10.2903054,123.9651446&hl=en&z=16&t=h&output=embed"
                width="100%"
                height="360"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="sm:col-span-2">
              <p
                className="text-xs font-semibold uppercase tracking-wide text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Campus Address
              </p>
              <p className="mt-1 text-sm leading-6 text-charcoal/80">
                The Runway Building, Pak-Pakan Rd
                <br />
                Lapu-Lapu City, Cebu, Philippines
              </p>

              <p
                className="mt-6 text-xs font-semibold uppercase tracking-wide text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Phone
              </p>
              <p className="mt-1 text-sm text-charcoal/80">+63 32 607 92</p>

              <p
                className="mt-6 text-xs font-semibold uppercase tracking-wide text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Office Hours
              </p>
              <p className="mt-1 text-sm leading-6 text-charcoal/80">
                Monday &ndash; Friday, 8:00 AM &ndash; 5:00 PM
                <br />
                Closed Saturday &amp; Sunday
              </p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=10.2903054,123.9651446" target="_blank" rel="noopener noreferrer" className="mt-6 inline-block border border-ink px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment">Get directions</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}