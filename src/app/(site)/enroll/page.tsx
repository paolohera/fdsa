import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EnrollmentForm from "./enrollment-form";
import ScrollReveal from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Enroll Now",
  description: "Apply to a program at Flight Dynamics School of Aeronautics.",
  alternates: { canonical: "/enroll" },
};

export default async function EnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string; name?: string; track?: string }>;
}) {
  const { program, name, track } = await searchParams;
  const supabase = await createClient();

  const { data: fields } = await supabase
    .from("enrollment_fields")
    .select("id, label, field_key, field_type, options, required")
    .order("sort_order", { ascending: true });

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
            Admissions
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Enroll Now
          </h1>
          {name && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
              Applying for <span className="font-semibold text-brass">{name}</span>
            </p>
          )}
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-xl px-6 py-16">
        <EnrollmentForm
          fields={fields ?? []}
          programCode={program ?? null}
          programName={name ?? null}
          track={track ?? null}
        />
      </section>
    </div>
  );
}