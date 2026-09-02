import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/hero-section";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";
import NewsCard from "@/components/news-card";
import NewsCoverflow from "@/components/news-coverflow";
import { sortByPriority } from "@/lib/news-priority";

export const revalidate = 60; // re-check for new published posts every 60s

export default async function HomePage() {
  const supabase = await createClient();

  // Pinned/featured posts — shown in the coverflow at the top of the section.
  const { data: highlightedPosts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at, image_url, location, priority")
    .eq("published", true)
    .in("priority", ["pinned", "featured"])
    .order("created_at", { ascending: false })
    .limit(5);

  // Everything else — shown in the bento grid below the coverflow.
  const { data: normalPosts } = await supabase
    .from("news_posts")
    .select("id, title, slug, body, created_at, image_url, location, priority")
    .eq("published", true)
    .eq("priority", "normal")
    .order("created_at", { ascending: false })
    .limit(6);

  const highlighted = highlightedPosts ? sortByPriority(highlightedPosts) : [];
  const normal = normalPosts ?? [];

  const { data: aboutImage } = await supabase
    .from("about_image")
    .select("image_url")
    .maybeSingle();

  const { data: heroImage } = await supabase
    .from("hero_image")
    .select("image_url")
    .maybeSingle();

  // "What We Offer" homepage cards — admin-managed via /admin/what-we-offer.
  // Featured cards (is_featured) always render first, then the rest in
  // their manually-set sort_order.
  const { data: featuredProgramsData } = await supabase
    .from("homepage_programs")
    .select("id, code, track, name, description, image_url, link_href, is_featured")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  const featuredPrograms = featuredProgramsData ?? [];

  return (
    <div>
      {/* Hero */}
      <HeroSection imageUrl={heroImage?.image_url} />

      {/* About preview */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:grid-cols-2 sm:items-center sm:gap-16">
          <ScrollReveal x={-60} y={0}>
            <div className="relative">
              {/* Corner brackets — an instrument-panel framing device that nods
                  to the aviation subject without leaning on a stock icon. */}
              <span className="pointer-events-none absolute -left-3 -top-3 h-8 w-8 border-l-2 border-t-2 border-brass sm:-left-4 sm:-top-4" />
              <span className="pointer-events-none absolute -bottom-3 -right-3 h-8 w-8 border-b-2 border-r-2 border-brass sm:-bottom-4 sm:-right-4" />

              {aboutImage ? (
                <div className="aspect-[4/3] w-full overflow-hidden bg-ink/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aboutImage.image_url}
                    alt="FDSA students"
                    className="h-full w-full object-cover"
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

              {/* Founding-year badge — a stamped ID-tag treatment echoing the
                  brass/ink crest elsewhere on the site. */}
              <div
                className="absolute -bottom-6 -right-2 flex h-24 w-24 rotate-[-6deg] flex-col items-center justify-center rounded-full border-2 border-brass bg-ink text-center shadow-lg sm:-right-6"
                aria-hidden="true"
              >
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brass">
                  Est.
                </span>
                <span
                  className="text-xl leading-none text-parchment"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  1988
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal x={60} y={0} delay={0.15}>
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                About FDSA
              </p>
              <h3
                className="mt-2 text-3xl leading-tight text-ink sm:text-4xl"
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
                className="group mt-7 inline-flex items-center gap-2 border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
              >
                More About Us
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What we offer */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollReveal>
          <div className="border-b border-ink/20 pb-3">
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Academics
            </p>
            <h3
              className="mt-1 text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What We Offer
            </h3>
          </div>
        </ScrollReveal>

        {featuredPrograms.length === 0 ? (
          <p className="mt-8 text-sm text-charcoal/60">
            No programs added yet. Add one from /admin/what-we-offer.
          </p>
        ) : (
          <ScrollStagger className="divide-y divide-ink/10">
            {featuredPrograms.map((program) => (
              <Link
                key={program.id}
                href={program.link_href || "/programs"}
                className="group -mx-4 grid grid-cols-1 gap-4 px-4 py-9 transition hover:bg-ink/[0.03] sm:grid-cols-12 sm:items-center sm:gap-6"
              >
                <div className="sm:col-span-3">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
                    {program.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={program.image_url}
                        alt={program.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 border border-dashed border-ink/25 text-center">
                        <span className="text-[10px] uppercase tracking-widest text-charcoal/40">
                          Photo placeholder
                        </span>
                        <span className="text-[9px] text-charcoal/30">{program.code}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brass">
                    {program.track}
                  </p>
                  <p
                    className="mt-1 text-3xl leading-none text-ink transition-colors group-hover:text-brass sm:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {program.code}
                  </p>
                </div>

                <div className="sm:col-span-4">
                  <h4
                    className="text-lg leading-snug text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {program.name}
                  </h4>
                  <p className="mt-1.5 text-sm leading-6 text-charcoal/70">
                    {program.description}
                  </p>
                </div>

                <div className="sm:col-span-2 sm:text-right">
                  <span className="inline-flex items-center gap-1.5 text-sm text-ink transition-all group-hover:gap-2.5 group-hover:text-brass">
                    Learn more
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </ScrollStagger>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/programs"
            className="group inline-flex items-center gap-2 border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
          >
            View More Programs
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* Latest news — coverflow for pinned/featured, bento grid for the rest */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollReveal>
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
        </ScrollReveal>

        {highlighted.length === 0 && normal.length === 0 && (
          <p className="mt-8 text-sm text-charcoal/60">
            No news posted yet. Check back soon.
          </p>
        )}

        {highlighted.length > 0 && (
          <div className="mt-8">
            <NewsCoverflow
              slides={highlighted.map((post) => ({
                slug: post.slug,
                title: post.title,
                imageUrl: post.image_url,
              }))}
            />
          </div>
        )}

        {normal.length > 0 && (
          <ScrollStagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-flow-row-dense sm:grid-cols-3 sm:auto-rows-[220px]">
            {normal.map((post) => (
              <NewsCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                body={post.body}
                createdAt={post.created_at}
                imageUrl={post.image_url}
                location={post.location}
                featured={false}
              />
            ))}
          </ScrollStagger>
        )}
      </section>

      {/* Find us */}
      <section className="border-t border-ink/10 bg-paper">
        <ScrollReveal className="mx-auto max-w-5xl px-6 py-16" y={50}>
          <div className="flex items-baseline justify-between border-b border-ink/20 pb-3">
            <h3
              className="text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Find Us
            </h3>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=10.2903054,123.9651446"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brass hover:underline"
            >
              Get directions &rarr;
            </a>
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

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=10.2903054,123.9651446"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block border border-ink px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
              >
                Get directions
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}