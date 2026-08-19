import StoryChapter from "@/components/story-chapter";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";
import { createClient } from "@/lib/supabase/server";

// Same dark brass-texture placeholder used on News cards without an
// image — keeps the "not yet uploaded" look consistent across the site.
const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export default async function AboutPage() {
  const supabase = await createClient();

  const [{ data: timeline }, { data: visionMission }, { data: coreValues }] = await Promise.all([
    supabase
      .from("timeline_entries")
      .select("id, year, title, body, image_url")
      .order("sort_order", { ascending: true }),
    supabase
      .from("vision_mission")
      .select("id, key, label, heading, body")
      .order("key", { ascending: false }), // "vision" before "mission"
    supabase
      .from("core_values")
      .select("id, letter, title, body")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        {/* Background photo — swap the path below for a campus/building shot.
            Reuses the same cover/center treatment as the homepage hero. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/about-hero.jpg)" }}
        />
        {/* Navy/brand overlay so white heading text stays legible over any photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        {/* pt-* clears the fixed header (h-14 mobile / h-16 md / h-[80px] lg,
            plus the 2px brass border) with room to spare so the heading
            never sits under the nav bar or the overlapping crest. */}
        <div className="relative mx-auto max-w-3xl px-6 pt-28 pb-16 text-center sm:pt-32 sm:pb-20 lg:pt-40">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            About FDSA
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            History &amp; Heritage
          </h1>
        </div>
      </section>

      {/* History timeline */}
      <section className="mx-auto max-w-5xl space-y-24 px-6 py-20 sm:space-y-32">
        {timeline?.map((item, index) => (
          <StoryChapter
            key={item.id}
            year={item.year}
            title={item.title}
            text={item.body}
            index={index}
            imageSrc={item.image_url ?? undefined}
          />
        ))}
      </section>

      {/* Vision & Mission — alternating image/text feature rows */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto max-w-5xl space-y-20 px-6 py-20">
          {visionMission?.map((item, index) => {
            const imageFirst = index % 2 === 0;

            const imageBlock = (
              <ScrollReveal x={imageFirst ? -60 : 60} y={0}>
                <div
                  className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
                  style={{ background: placeholderBg }}
                >
                  <span
                    className="text-xs uppercase tracking-[0.3em] text-parchment/50"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {`Add ${item.key} photo — public/${item.key}.jpg`}
                  </span>
                </div>
              </ScrollReveal>
            );

            const textBlock = (
              <ScrollReveal x={imageFirst ? 60 : -60} y={0} delay={0.15}>
                <div className="flex h-full flex-col justify-center">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.label}
                  </p>
                  <h2
                    className="mt-2 text-3xl text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.heading}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-charcoal/80">{item.body}</p>
                </div>
              </ScrollReveal>
            );

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-12"
              >
                {imageFirst ? (
                  <>
                    {imageBlock}
                    {textBlock}
                  </>
                ) : (
                  <>
                    <div className="sm:order-2">{imageBlock}</div>
                    <div className="sm:order-1">{textBlock}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Values — modern image-card grid */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollReveal className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What Guides Us
          </p>
          <h2
            className="mt-2 text-3xl text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Core Values
          </h2>
        </ScrollReveal>

        <ScrollStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues?.map((value) => (
            <div
              key={value.id}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden border border-ink/15"
              style={{ background: placeholderBg }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent transition group-hover:from-ink/95" />
              <div className="relative z-10 p-5">
                <span
                  className="text-4xl font-bold text-brass"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value.letter}
                </span>
                <h3
                  className="mt-1 text-lg text-parchment"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-parchment/75">{value.body}</p>
              </div>
            </div>
          ))}
        </ScrollStagger>
      </section>
    </div>
  );
}