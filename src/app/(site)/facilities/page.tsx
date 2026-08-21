import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";
import { facilities } from "@/lib/facilities-data";

export const metadata: Metadata = {
  title: "Facilities",
  description:
    "Explore FDSA's hangars, labs, and learning spaces at the Mactan-Cebu International Airport campus, built for hands-on aviation training.",
  alternates: { canonical: "/facilities" },
};

// Same dark brass-texture placeholder used across the site (News cards,
// Core Values, Programs) — keeps the "photo not uploaded yet" look
// consistent until real facility photos are ready to drop in.
const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export default function FacilitiesPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        {/* Background photo — swap the path below for a facilities/campus photo. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/facilities-hero.jpg)" }}
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
          {facilities.map((facility) => (
            <Link
              key={facility.slug}
              href={`/facilities/${facility.slug}`}
              className="group flex flex-col overflow-hidden border border-ink/15 bg-paper transition hover:border-ink/30 hover:shadow-md"
            >
              <div
                className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
                style={{ background: placeholderBg }}
              >
                <span
                  className="px-4 text-center text-xs uppercase tracking-[0.3em] text-parchment/50"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Photo coming soon
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3
                  className="text-base leading-snug text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {facility.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-charcoal/70">
                  {facility.description}
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