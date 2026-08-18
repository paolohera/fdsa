import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";

const programGroups = [
  {
    label: "Baccalaureate",
    approvedBy: "Approved by CHED — Commission on Higher Education",
    programs: [
      {
        code: "BAMT",
        name: "Bachelor in Aircraft Maintenance Technology",
        description:
          "A four-year degree preparing students for licensure and careers maintaining aircraft airframes, powerplants, and systems.",
      },
      {
        code: "BAET",
        name: "Bachelor in Aviation Electronics Technology",
        description:
          "A four-year degree focused on aircraft avionics, communication systems, and electronic instrumentation.",
      },
    ],
  },
  {
    label: "Two-Year Technical",
    approvedBy: "Approved by CAAP — Civil Aviation Authority of the Philippines",
    programs: [
      {
        code: "AMT",
        name: "Aircraft Maintenance Technology",
        description:
          "Hands-on technical training in aircraft airframe and powerplant inspection, servicing, and repair.",
      },
      {
        code: "AET",
        name: "Aviation Electronics Technology",
        description:
          "Technical training in aircraft electronics, instrumentation, and communication systems.",
      },
    ],
  },
  {
    label: "Senior High School",
    approvedBy: "Approved by DepEd — Department of Education",
    programs: [
      {
        code: "ABM",
        name: "Accountancy, Business, and Management",
        description:
          "Prepares students for careers and further study in business, accounting, and finance.",
      },
      {
        code: "STEM",
        name: "Science, Technology, Engineering, & Mathematics",
        description:
          "For students pursuing engineering, aviation technology, and other science-based career paths.",
      },
      {
        code: "GAS",
        name: "General Academic Strand",
        description:
          "A flexible track for students still exploring their future academic and career direction.",
      },
    ],
  },
];

// Same dark brass-texture placeholder used across the site (News cards,
// Core Values) — keeps the "photo not uploaded yet" look consistent.
const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export default function ProgramsPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        {/* Background photo — swap the path below for a relevant campus/training photo. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/programs-hero.jpg)" }}
        />
        {/* Navy/brand overlay so parchment text stays legible over any photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink/95" />

        {/* pt-* clears the fixed header (h-14 mobile / h-16 md / h-[80px] lg,
            plus the 2px brass border) with room to spare so the heading
            never sits under the nav bar or the overlapping crest. */}
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
            Flight, technical, and academic programs recognized by the
            relevant Philippine government authorities. All programs are
            subject to the regulatory guidelines of their approving body.
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-14">
          {programGroups.map((group) => (
            <div key={group.label}>
              <ScrollReveal className="border-b border-ink/20 pb-2">
                <h2
                  className="text-xl text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {group.label}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-brass">
                  {group.approvedBy}
                </p>
              </ScrollReveal>

              <ScrollStagger className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.programs.map((program) => (
                  <div
                    key={program.code}
                    className="group flex flex-col overflow-hidden border border-ink/15 bg-paper transition hover:border-ink/30 hover:shadow-md"
                  >
                    <div
                      className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
                      style={{ background: placeholderBg }}
                    >
                      <span
                        className="text-4xl font-bold text-parchment/90 transition duration-500 group-hover:scale-105"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {program.code}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3
                        className="text-base leading-snug text-ink"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {program.name}
                      </h3>
                      <p className="mt-2 flex-1 text-xs leading-5 text-charcoal/70">
                        {program.description}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollStagger>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}