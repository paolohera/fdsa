import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgramDetailPage from "@/components/program-detail-page";
import {
  baccalaureatePrograms,
  freshmanRequirements,
  transferRequirements,
  findProgramByCode,
} from "@/lib/program-data";

export function generateStaticParams() {
  return baccalaureatePrograms.map((p) => ({ code: p.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const program = findProgramByCode(baccalaureatePrograms, code);
  if (!program) return {};
  return {
    title: program.name,
    description: program.description,
    alternates: { canonical: `/programs/baccalaureate/${program.code.toLowerCase()}` },
  };
}

export default async function BaccalaureateProgramPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const program = findProgramByCode(baccalaureatePrograms, code);
  if (!program) notFound();

  return (
    <ProgramDetailPage
      eyebrow="Approved by CHED — Commission on Higher Education"
      program={program}
      requirementGroups={[
        { label: "Freshman Applicants", items: freshmanRequirements },
        { label: "Transfer Applicants", items: transferRequirements },
      ]}
      trackSlug="baccalaureate"
      trackHref="/programs/baccalaureate"
      trackTitle="Baccalaureate Programs"
    />
  );
}