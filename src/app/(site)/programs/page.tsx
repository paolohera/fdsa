import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";
import { baccalaureatePrograms, twoYearPrograms, shsPrograms } from "@/lib/program-data";

export const metadata: Metadata = {
  title: "Programs Offered",
  description:
    "Explore FDSA's Baccalaureate, Two-Year Technical, and Senior High School programs — recognized by CHED, CAAP, and DepEd.",
  alternates: { canonical: "/programs" },
};

const tracks = [
  {
    href: "/programs/baccalaureate",
    label: "Baccalaureate",
    approvedBy: "Approved by CHED",
    programs: baccalaureatePrograms,
  },
  {
    href: "/programs/two-year-technical",
    label: "Two-Year Technical",
    approvedBy: "Approved by CAAP",
    programs: twoYearPrograms,
  },
  {
    href: "/programs/senior-high-school",
    label: "Senior High School",
    approvedBy: "Approved by DepEd",
    programs: shsPrograms,
  },
];

export default function ProgramsPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/programs-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        <ScrollReveal className="relative mx-auto max-w-3xl px-6 pt-28 pb-16 text-center sm:pt-32 sm:pb-20 lg:pt-40">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Academics
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Programs Offered
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
            Flight, technical, and academic programs recognized by the relevant Philippine
            government authorities.
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollStagger className="grid gap-8 sm:grid-cols-3">
          {tracks.map((track) => (
            <Link
              key={track.href}
              href={track.href}
              className="group flex flex-col border border-ink/15 bg-paper p-6 transition hover:border-ink/30 hover:shadow-md"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brass">
                {track.approvedBy}
              </p>
              <h2
                className="mt-2 text-xl text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {track.label}
              </h2>
              <ul className="mt-4 flex-1 space-y-1.5">
                {track.programs.map((p) => (
                  <li key={p.code} className="text-sm text-charcoal/70">
                    <span className="font-semibold text-ink">{p.code}</span> — {p.name}
                  </li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass transition-transform duration-300 group-hover:translate-x-1">
                View Program
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </ScrollStagger>
      </section>
    </div>
  );
}