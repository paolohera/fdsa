import type { Metadata } from "next";
import ProgramTrackPage from "@/components/program-track-page";
import { baccalaureatePrograms, freshmanRequirements, transferRequirements } from "@/lib/program-data";

export const metadata: Metadata = {
  title: "Baccalaureate Programs",
  description:
    "CHED-recognized four-year Baccalaureate degrees at FDSA: Bachelor in Aircraft Maintenance Technology and Bachelor in Aviation Electronics Technology.",
  alternates: { canonical: "/programs/baccalaureate" },
};

export default function BaccalaureatePage() {
  return (
    <ProgramTrackPage
      eyebrow="Approved by CHED — Commission on Higher Education"
      title="Baccalaureate Programs"
      intro="Four-year degrees preparing students for licensure and long-term careers across the aviation maintenance and electronics industries."
      programs={baccalaureatePrograms}
      requirementGroups={[
        { label: "Freshman Applicants", items: freshmanRequirements },
        { label: "Transfer Applicants", items: transferRequirements },
      ]}
      trackSlug="baccalaureate"
    />
  );
}