import Link from "next/link";
import { CheckCircle2, Clock, GraduationCap, ClipboardList } from "lucide-react";
import type { Program } from "@/lib/program-data";

export default function ProgramCard({
  program,
  trackSlug,
}: {
  program: Program;
  trackSlug: string;
}) {
  return (
    <div className="border border-ink/15 bg-paper">
      <div className="border-b border-ink/10 bg-parchment/40 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {program.name}
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wide text-brass">
            {program.code}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-charcoal/60">
          <Clock size={13} />
          {program.duration}
        </p>
        <p className="mt-3 text-sm leading-6 text-charcoal/80">{program.description}</p>
        <Link
          href={`/enroll?program=${encodeURIComponent(program.code)}&name=${encodeURIComponent(program.name)}&track=${encodeURIComponent(trackSlug)}`}
          className="mt-4 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-parchment transition hover:bg-brass hover:text-ink"
        >
          Enroll Now
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-2 sm:px-8">
        <div>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass">
            <ClipboardList size={14} />
            Curriculum Highlights
          </h3>
          <ul className="mt-3 space-y-2">
            {program.curriculum.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-6 text-charcoal/80">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brass" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass">
            <GraduationCap size={14} />
            Career Outcomes
          </h3>
          <ul className="mt-3 space-y-2">
            {program.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-6 text-charcoal/80">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brass" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}