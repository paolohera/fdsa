import type { Metadata } from "next";
import ScrollReveal from "@/components/scroll-reveal";
import MagneticProgramCarousel from "@/components/magnetic-program-carousel";
import { createClient } from "@/lib/supabase/server";
import { baccalaureatePrograms, twoYearPrograms, shsPrograms } from "@/lib/program-data";

export const metadata: Metadata = {
  title: "Programs Offered",
  description:
    "Explore FDSA's Baccalaureate, Two-Year Technical, and Senior High School programs — recognized by CHED, CAAP, and DepEd.",
  alternates: { canonical: "/programs" },
};

export const revalidate = 3600;

export default async function ProgramsPage() {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("program_images")
    .select("program_code, image_url, label, is_custom");

  const imageByCode = new Map((images ?? []).map((img) => [img.program_code, img.image_url]));
  const customCards = (images ?? []).filter((img) => img.is_custom);

  const allPrograms = [
    ...baccalaureatePrograms.map((p) => ({
      href: `/programs/baccalaureate/${p.code.toLowerCase()}`,
      code: p.code,
      imageSrc: imageByCode.get(p.code) ?? undefined,
    })),
    ...twoYearPrograms.map((p) => ({
      href: `/programs/two-year-technical/${p.code.toLowerCase()}`,
      code: p.code,
      imageSrc: imageByCode.get(p.code) ?? undefined,
    })),
    ...shsPrograms.map((p) => ({
      href: `/programs/senior-high-school/${p.code.toLowerCase()}`,
      code: p.code,
      imageSrc: imageByCode.get(p.code) ?? undefined,
    })),
    // Custom admin-added cards — no dedicated track page, so they route
    // straight to the enrollment form with their code/label pre-filled.
    ...customCards.map((c) => ({
      href: `/enroll?program=${encodeURIComponent(c.program_code)}&name=${encodeURIComponent(c.label ?? c.program_code)}`,
      code: c.program_code,
      imageSrc: c.image_url ?? undefined,
    })),
  ];

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
        <ScrollReveal>
          <p className="mb-8 text-center text-sm text-charcoal/60">
            Hover to preview, click to explore a program.
          </p>
        </ScrollReveal>
        <MagneticProgramCarousel items={allPrograms} />
      </section>
    </div>
  );
}