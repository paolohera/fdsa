import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgramDetailPage from "@/components/program-detail-page";
import { shsPrograms, shsRequirements, findProgramByCode } from "@/lib/program-data";

export function generateStaticParams() {
  return shsPrograms.map((p) => ({ code: p.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const program = findProgramByCode(shsPrograms, code);
  if (!program) return {};
  return {
    title: program.name,
    description: program.description,
    alternates: { canonical: `/programs/senior-high-school/${program.code.toLowerCase()}` },
  };
}

export default async function SHSProgramPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const program = findProgramByCode(shsPrograms, code);
  if (!program) notFound();

  return (
    <ProgramDetailPage
      eyebrow="Approved by DepEd — Department of Education"
      program={program}
      requirementGroups={[{ label: "Grade 11 Admission", items: shsRequirements }]}
      trackSlug="senior-high-school"
      trackHref="/programs/senior-high-school"
      trackTitle="Senior High School"
    />
  );
}