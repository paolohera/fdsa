import type { Metadata } from "next";
import ProgramTrackPage from "@/components/program-track-page";
import { shsPrograms, shsRequirements } from "@/lib/program-data";

export const metadata: Metadata = {
  title: "Senior High School",
  description:
    "DepEd-recognized Senior High School strands at FDSA: STEM, ABM, and GAS — Grades 11 and 12.",
  alternates: { canonical: "/programs/senior-high-school" },
};

export default function SeniorHighSchoolPage() {
  return (
    <ProgramTrackPage
      eyebrow="Approved by DepEd — Department of Education"
      title="Senior High School"
      intro="Academic strands for Grades 11–12, building the foundation for aviation, business, and general college pathways."
      programs={shsPrograms}
      requirementGroups={[{ label: "Grade 11 Admission", items: shsRequirements }]}
      trackSlug="senior-high-school"
    />
  );
}