import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Facilities",
  description:
    "Explore FDSA's hangars, labs, and learning spaces at the Mactan-Cebu International Airport campus, built for hands-on aviation training.",
  alternates: { canonical: "/facilities" },
};

const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export const revalidate = 60;

export default async function FacilitiesPage() {
  const supabase = await createClient();

  const { data: facilities } = await supabase
    .from("facilities")
    .select(`
      id,
      title,
      slug,
      short_description,
      cover_image,
      full_description,
      facility_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  const count = facilities?.length ?? 0;

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/facilities-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        <ScrollReveal className="relative mx-auto max-w-3xl px-6 pt-28 pb-16 text-center sm:pt-32 sm:pb-20 lg:pt-40">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Campus
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Facilities
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
            Hangars, labs, and learning spaces at the Mactan-Cebu International
            Airport campus, built around hands-on aviation training.
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollStagger
          className={
            count === 1
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center sm:justify-items-start"
              : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {facilities?.map((facility) => {
            const sortedImages = (facility.facility_images ?? []).sort(
              (a, b) => a.display_order - b.display_order
            );
            const coverImage = facility.cover_image || sortedImages[0]?.image_url;

            return (
              <Link
                key={facility.id}
                href={`/facilities/${facility.slug}`}
                className="group flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={facility.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-2 text-center"
                      style={{ background: placeholderBg }}
                    >
                      <span className="text-xs uppercase tracking-widest text-parchment/50">
                        Photo coming soon
                      </span>
                      <span className="text-[11px] text-parchment/30">
                        Add one from /admin/facilities
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass/80"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Campus
                  </p>
                  <h3
                    className="mt-1.5 text-lg leading-snug text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {facility.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-charcoal/65">
                    {facility.short_description ||
                      facility.full_description ||
                      "No description available"}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass transition-transform duration-300 group-hover:translate-x-1">
                    View Facility
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </ScrollStagger>
      </section>
    </div>
  );
}