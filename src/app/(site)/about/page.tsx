import StoryChapter from "@/components/story-chapter";
import ScrollReveal from "@/components/scroll-reveal";
import ScrollStagger from "@/components/scroll-stagger";

const timeline = [
  {
    year: "1988",
    title: "A Hangar in Manila",
    text: "Engr. Juanito M. dela Cruz founded Link Flight Aviation School at the AIRSPAN Hangar, Manila Domestic Airport, Pasay City.",
  },
  {
    year: "1989",
    title: "Wings Expand",
    text: "Nobuyoshi Hisada joined as a business partner, expanding flight training equipment and introducing helicopter training alongside fixed-wing operations.",
  },
  {
    year: "1991",
    title: "Chasing Clear Skies",
    text: "A branch opened in Lahug, Cebu City, drawn by favorable weather — later relocating after Lahug Airport's closure.",
  },
  {
    year: "1993",
    title: "A New Home at Mactan",
    text: "Operations moved to Mactan-Cebu International Airport (MCIAA), Pajac, Lapu-Lapu City. Manila operations merged in, and the school was renamed Flight Dynamics School of Aviation.",
  },
  {
    year: "1995",
    title: "Made Official",
    text: "Incorporated as Flight Dynamics School of Aeronautics, Inc. on September 12, under SEC Reg. No. CN095-000253.",
  },
  {
    year: "2004",
    title: "Room to Grow",
    text: "Relocated to a new campus at Corner Basak-Iba, improving accessibility for students, faculty, and staff.",
  },
  {
    year: "2006–2009",
    title: "Recognized Beyond Borders",
    text: "Accredited by the Bureau of Immigration and Deportation (2006) and the Department of Foreign Affairs (2009).",
  },
  {
    year: "Today",
    title: "A Legacy Airborne",
    text: "FDSA offers Flight and Ground Training, Technical, and Degree programs approved by CHED and TESDA, with continuing recognition from CAAP.",
  },
];

const visionMission = [
  {
    label: "Vision",
    placeholderNote: "Add campus/hangar photo — public/vision.jpg",
    text: "To be one of the country's leading institutions of excellence in Aviation, Science, Technology, and Business Education — developing competent, ethical, and safety-driven professionals for the benefit of society.",
  },
  {
    label: "Mission",
    placeholderNote: "Add classroom/training photo — public/mission.jpg",
    text: "FDSA delivers learner-centered, holistic education and training that develops competent, ethical, and competitive professionals and leaders. Through industry collaboration, research, and educational innovation, FDSA advances science, technology, and business education, and contributes to national development.",
  },
];

const coreValues = [
  {
    letter: "F",
    title: "Faith",
    text: "Above all, faith in God to provide the knowledge, understanding, and wisdom to carry out our mission and vision.",
  },
  {
    letter: "D",
    title: "Duty",
    text: "Carrying out the duties of our assigned position with complete transparency and honesty.",
  },
  {
    letter: "S",
    title: "Service",
    text: "Extending service to students and the community with dignified commitment, responsive to public interest over personal interest.",
  },
  {
    letter: "A",
    title: "Accountability",
    text: "Accountable to parents, students, the board of trustees, and government agencies, in line with Philippine educational law.",
  },
];

// Same dark brass-texture placeholder used on News cards without an
// image — keeps the "not yet uploaded" look consistent across the site.
const placeholderBg =
  "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)";

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            About FDSA
          </p>
          <h1
            className="mt-2 text-4xl text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            History &amp; Heritage
          </h1>
        </div>
      </section>

      {/* History timeline */}
      <section className="mx-auto max-w-5xl space-y-24 px-6 py-20 sm:space-y-32">
        {timeline.map((item, index) => (
          <StoryChapter
            key={item.year}
            year={item.year}
            title={item.title}
            text={item.text}
            index={index}
          />
        ))}
      </section>

      {/* Vision & Mission — alternating image/text feature rows */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto max-w-5xl space-y-20 px-6 py-20">
          {visionMission.map((item, index) => {
            const imageFirst = index % 2 === 0;

            const imageBlock = (
              <ScrollReveal x={imageFirst ? -60 : 60} y={0}>
                <div
                  className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
                  style={{ background: placeholderBg }}
                >
                  <span
                    className="text-xs uppercase tracking-[0.3em] text-parchment/50"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.placeholderNote}
                  </span>
                </div>
              </ScrollReveal>
            );

            const textBlock = (
              <ScrollReveal x={imageFirst ? 60 : -60} y={0} delay={0.15}>
                <div className="flex h-full flex-col justify-center">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.label}
                  </p>
                  <h2
                    className="mt-2 text-3xl text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.label === "Vision" ? "Where we're headed" : "How we get there"}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-charcoal/80">
                    {item.text}
                  </p>
                </div>
              </ScrollReveal>
            );

            return (
              <div
                key={item.label}
                className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-12"
              >
                {imageFirst ? (
                  <>
                    {imageBlock}
                    {textBlock}
                  </>
                ) : (
                  <>
                    <div className="sm:order-2">{imageBlock}</div>
                    <div className="sm:order-1">{textBlock}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Values — modern image-card grid */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <ScrollReveal className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What Guides Us
          </p>
          <h2
            className="mt-2 text-3xl text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Core Values
          </h2>
        </ScrollReveal>

        <ScrollStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => (
            <div
              key={value.letter}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden border border-ink/15"
              style={{ background: placeholderBg }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent transition group-hover:from-ink/95" />
              <div className="relative z-10 p-5">
                <span
                  className="text-4xl font-bold text-brass"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value.letter}
                </span>
                <h3
                  className="mt-1 text-lg text-parchment"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-parchment/75">
                  {value.text}
                </p>
              </div>
            </div>
          ))}
        </ScrollStagger>
      </section>
    </div>
  );
}