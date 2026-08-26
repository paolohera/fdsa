import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgramDetailPage from "@/components/program-detail-page";
import {
  twoYearPrograms,
  freshmanRequirements,
  transferRequirements,
  findProgramByCode,
} from "@/lib/program-data";

export function generateStaticParams() {
  return twoYearPrograms.map((p) => ({ code: p.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const program = findProgramByCode(twoYearPrograms, code);
  if (!program) return {};
  return {
    title: program.name,
    description: program.description,
    alternates: { canonical: `/programs/two-year-technical/${program.code.toLowerCase()}` },
  };
}

export default async function TwoYearProgramPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const program = findProgramByCode(twoYearPrograms, code);
  if (!program) notFound();

  return (
    <ProgramDetailPage
      eyebrow="Approved by CAAP — Civil Aviation Authority of the Philippines"
      program={program}
      requirementGroups={[
        { label: "Freshman Applicants", items: freshmanRequirements },
        { label: "Transfer Applicants", items: transferRequirements },
      ]}
      trackSlug="two-year-technical"
      trackHref="/programs/two-year-technical"
      trackTitle="Two-Year Technical Programs"
    />
  );
}