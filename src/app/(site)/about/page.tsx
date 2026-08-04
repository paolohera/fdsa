const timeline = [
  {
    year: "1988",
    text: "Engr. Juanito M. dela Cruz founded Link Flight Aviation School at the AIRSPAN Hangar, Manila Domestic Airport, Pasay City.",
  },
  {
    year: "1989",
    text: "Nobuyoshi Hisada joined as a business partner, expanding flight training equipment and introducing helicopter training alongside fixed-wing operations.",
  },
  {
    year: "1991",
    text: "A branch opened in Lahug, Cebu City, drawn by favorable weather — later relocating after Lahug Airport's closure.",
  },
  {
    year: "1993",
    text: "Operations moved to Mactan-Cebu International Airport (MCIAA), Pajac, Lapu-Lapu City. Manila operations merged in, and the school was renamed Flight Dynamics School of Aviation.",
  },
  {
    year: "1995",
    text: "Incorporated as Flight Dynamics School of Aeronautics, Inc. on September 12, under SEC Reg. No. CN095-000253.",
  },
  {
    year: "2004",
    text: "Relocated to a new campus at Corner Basak-Iba, improving accessibility for students, faculty, and staff.",
  },
  {
    year: "2006–2009",
    text: "Accredited by the Bureau of Immigration and Deportation (2006) and the Department of Foreign Affairs (2009).",
  },
  {
    year: "Today",
    text: "FDSA offers Flight and Ground Training, Technical, and Degree programs approved by CHED and TESDA, with continuing recognition from CAAP.",
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
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-8 border-l-2 border-ink/15 pl-6">
          {timeline.map((item) => (
            <div key={item.year} className="relative">
              <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-brass" />
              <p
                className="text-sm font-semibold text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.year}
              </p>
              <p className="mt-1 text-sm leading-6 text-charcoal/80">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2">
          <div>
            <h2
              className="text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Vision
            </h2>
            <p className="mt-3 text-sm leading-7 text-charcoal/80">
              To be one of the country&apos;s leading institutions of
              excellence in Aviation, Science, Technology, and Business
              Education — developing competent, ethical, and safety-driven
              professionals for the benefit of society.
            </p>
          </div>
          <div>
            <h2
              className="text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mission
            </h2>
            <p className="mt-3 text-sm leading-7 text-charcoal/80">
              FDSA delivers learner-centered, holistic education and training
              that develops competent, ethical, and competitive professionals
              and leaders. Through industry collaboration, research, and
              educational innovation, FDSA advances science, technology, and
              business education, and contributes to national development.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2
          className="text-center text-2xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Core Values
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => (
            <div
              key={value.letter}
              className="border border-ink/15 bg-paper p-6 text-center"
            >
              <span
                className="text-3xl font-bold text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value.letter}
              </span>
              <h3
                className="mt-2 text-lg text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-charcoal/70">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}