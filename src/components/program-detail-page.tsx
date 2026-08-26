import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";
import ProgramCard from "@/components/program-card";
import type { Program } from "@/lib/program-data";

export default function ProgramDetailPage({
  eyebrow,
  program,
  requirementGroups,
  trackSlug,
  trackHref,
  trackTitle,
}: {
  eyebrow: string;
  program: Program;
  requirementGroups: { label: string; items: string[] }[];
  trackSlug: string;
  trackHref: string;
  trackTitle: string;
}) {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/programs-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        <ScrollReveal className="relative mx-auto max-w-3xl px-6 pt-28 pb-16 text-center sm:pt-32 sm:pb-20 lg:pt-40">
          <Link
            href={trackHref}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-parchment/60 transition hover:text-parchment"
          >
            <ArrowLeft size={14} />
            {trackTitle}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brass" style={{ fontFamily: "var(--font-display)" }}>
            {eyebrow}
          </p>
          <h1 className="mt-2 text-4xl text-parchment" style={{ fontFamily: "var(--font-display)" }}>
            {program.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
            {program.description}
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollReveal>
          <ProgramCard program={program} trackSlug={trackSlug} />
        </ScrollReveal>
      </section>

      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brass" style={{ fontFamily: "var(--font-display)" }}>
              Admissions
            </p>
            <h2 className="mt-2 text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Requirements
            </h2>
          </ScrollReveal>

          <ScrollStagger className="mt-8 grid gap-6 sm:grid-cols-2">
            {requirementGroups.map((group) => (
              <div key={group.label} className="border border-ink/15 bg-parchment/30 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
                  {group.label}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-charcoal/75">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brass" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollStagger>

          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-parchment"
            >
              Ask About Enrollment
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}