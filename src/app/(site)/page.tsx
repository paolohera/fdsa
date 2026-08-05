import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/hero-carousel";

export const revalidate = 60; // re-check for new published posts every 60s

export default async function HomePage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: heroImages } = await supabase
    .from("hero_images")
    .select("id, image_url")
    .order("position", { ascending: true });

  const { data: aboutImage } = await supabase
    .from("about_image")
    .select("image_url")
    .maybeSingle();

  return (
    <div>
      {/* Hero carousel */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <HeroCarousel images={heroImages ?? []} />
      </div>

      {/* About preview */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:items-center">
          {aboutImage ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={aboutImage.image_url}
                alt="FDSA students"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-ink/5 text-center">
              <span className="text-xs uppercase tracking-widest text-charcoal/40">
                Student photo placeholder
              </span>
              <span className="text-[11px] text-charcoal/30">
                Add one from /admin/about
              </span>
            </div>
          )}

          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About FDSA
            </p>
            <h3
              className="mt-2 text-3xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Training aviation professionals since 1988.
            </h3>
            <p className="mt-4 text-sm leading-7 text-charcoal/80">
              From a single hangar in Manila to a full campus at Mactan-Cebu
              International Airport, FDSA has spent over three decades
              preparing students for careers in aircraft maintenance,
              avionics, and aviation business — guided by faith, duty,
              service, and accountability.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
            >
              More About Us
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
            
             <a href="https://www.google.com/maps/dir/?api=1&destination=10.2903054,123.9651446" target="_blank" rel="noopener noreferrer" className="text-sm text-brass hover:underline">Get directions &rarr;</a>
          </div>

          <div className="mt-6 grid gap-8 sm:grid-cols-5">
            <div className="overflow-hidden border border-ink/15 sm:col-span-3">
              <iframe
                title="FDSA campus location"
                src="https://www.google.com/maps/embed?pb=!4v1785888596261!6m8!1m7!1sbQ3j0vlAK09sSCKzu0dtXw!2m2!1d10.29024304800096!2d123.965358500781!3f299.6511160914959!4f-1.0900429119214152!5f0.7820865974627469"
                width="100%"
                height="360"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; gyroscope; magnetometer"
                allowFullScreen
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

              <a href="https://www.google.com/maps/dir/?api=1&destination=10.2903054,123.9651446" target="_blank" rel="noopener noreferrer" className="text-sm text-brass hover:underline">Get directions &rarr;</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}