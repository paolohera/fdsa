const programGroups = [
  {
    label: "Baccalaureate",
    approvedBy: "Approved by CHED — Commission on Higher Education",
    programs: [
      { code: "BAMT", name: "Bachelor in Aircraft Maintenance Technology" },
      { code: "BAET", name: "Bachelor in Aviation Electronics Technology" },
    ],
  },
  {
    label: "Two-Year Technical",
    approvedBy: "Approved by CAAP — Civil Aviation Authority of the Philippines",
    programs: [
      { code: "AMT", name: "Aircraft Maintenance Technology" },
      { code: "AET", name: "Aviation Electronics Technology" },
    ],
  },
  {
    label: "Senior High School",
    approvedBy: "Approved by DepEd — Department of Education",
    programs: [
      { code: "ABM", name: "Accountancy, Business, and Management" },
      { code: "STEM", name: "Science, Technology, Engineering, & Mathematics" },
      { code: "GAS", name: "General Academic Strand" },
    ],
  },
];

export default function ProgramsPage() {
  return (
    <div>
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Academics
          </p>
          <h1
            className="mt-2 text-4xl text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Programs Offered
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-charcoal/70">
            Flight, technical, and academic programs recognized by the
            relevant Philippine government authorities. All programs are
            subject to the regulatory guidelines of their approving body.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-14">
          {programGroups.map((group) => (
            <div key={group.label}>
              <div className="border-b border-ink/20 pb-2">
                <h2
                  className="text-xl text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {group.label}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-brass">
                  {group.approvedBy}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.programs.map((program) => (
                  <div
                    key={program.code}
                    className="border border-ink/15 bg-paper p-5"
                  >
                    <p
                      className="text-2xl font-bold text-brass"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {program.code}
                    </p>
                    <p className="mt-2 text-sm leading-5 text-charcoal/80">
                      {program.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}