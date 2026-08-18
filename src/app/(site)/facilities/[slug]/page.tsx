import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { facilities } from "@/lib/facilities-data";

// Same dark brass-texture placeholder used across the site — keeps the
// "photo not uploaded yet" look consistent until real facility photos
// are ready to drop in.
const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export function generateStaticParams() {
  return facilities.map((facility) => ({ slug: facility.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const facility = facilities.find((f) => f.slug === slug);
  if (!facility) return {};
  return {
    title: `${facility.name} | FDSA Facilities`,
    description: facility.description,
  };
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const facility = facilities.find((f) => f.slug === slug);

  if (!facility) {
    notFound();
  }

  return (
    <div>
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto max-w-3xl px-6 pt-28 pb-12 sm:pt-32 lg:pt-40">
          <Link
            href="/facilities"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass transition hover:text-ink"
          >
            <ArrowLeft size={14} />
            All Facilities
          </Link>

          <ScrollReveal>
            <p
              className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-brass"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Campus
            </p>
            <h1
              className="mt-2 text-4xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {facility.name}
            </h1>
            <p className="mt-4 text-sm leading-7 text-charcoal/80">
              {facility.description}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <ScrollReveal>
          <div
            className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden"
            style={{ background: placeholderBg }}
          >
            <span
              className="text-xs uppercase tracking-[0.3em] text-parchment/50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Photo coming soon
            </span>
          </div>
        </ScrollReveal>

        {facility.highlights.length > 0 && (
          <ScrollReveal delay={0.1} className="mt-10">
            <h2
              className="text-xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Highlights
            </h2>
            <ul className="mt-4 space-y-3">
              {facility.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5 text-sm text-charcoal/80">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brass" />
                  {highlight}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}