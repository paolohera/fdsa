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
      facility_images (id)
    `)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/facilities-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        <ScrollReveal className="relative mx-auto max-w-3xl px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40">
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
        <ScrollStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities?.map((facility) => (
            <Link
              key={facility.id}
              href={`/facilities/${facility.slug}`}
              className="group flex flex-col overflow-hidden border border-ink/15 bg-paper transition hover:border-ink/30 hover:shadow-md"
            >
              <div
                className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
              >
                {facility.cover_image ? (
                  <img
                    src={facility.cover_image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-ink/5 text-center">
                    <span className="text-xs uppercase tracking-widest text-charcoal/40">
                      Photo coming soon
                    </span>
                    <span className="text-[11px] text-charcoal/30">
                      Add one from /admin/facilities
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3
                  className="text-base leading-snug text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {facility.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-charcoal/70">
                  {facility.short_description || facility.full_description?.slice(0, 120) + "..." || "No description available"}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass transition-transform duration-300 group-hover:translate-x-1">
                  View Facility
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </ScrollStagger>
      </section>
    </div>
  );
}