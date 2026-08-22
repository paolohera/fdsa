import type { Metadata } from "next";
import ProgramTrackPage from "@/components/program-track-page";
import { twoYearPrograms, freshmanRequirements, transferRequirements } from "@/lib/program-data";

export const metadata: Metadata = {
  title: "Two-Year Technical Programs",
  description:
    "CAAP-recognized two-year technical programs at FDSA: Aircraft Maintenance Technology and Aviation Electronics Technology.",
  alternates: { canonical: "/programs/two-year-technical" },
};

export default function TwoYearTechnicalPage() {
  return (
    <ProgramTrackPage
      eyebrow="Approved by CAAP — Civil Aviation Authority of the Philippines"
      title="Two-Year Technical Programs"
      intro="Hands-on technical training built for faster entry into aircraft maintenance and avionics careers."
      programs={twoYearPrograms}
      requirementGroups={[
        { label: "Freshman Applicants", items: freshmanRequirements },
        { label: "Transfer Applicants", items: transferRequirements },
      ]}
    />
  );
}