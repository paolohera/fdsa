export type Program = {
  code: string;
  name: string;
  duration: string;
  description: string;
  // TODO: replace with your actual approved curriculum/subject list per
  // program — not available in the handbook, which only covers grading
  // and admission policy, not course-by-course syllabi.
  curriculum: string[];
  outcomes: string[];
};

export const freshmanRequirements = [
  "Original Report Card / Form 138 (High School Card)",
  "Original Certificate of Good Moral Character",
  "PSA Birth Certificate (photocopy on submission; original must be presented)",
  "Four (4) copies of latest 2×2 ID picture, white background",
  "Two (2) pieces large brown envelopes",
  "Entrance Exam — required for applicants with below 80% General Average",
];

export const transferRequirements = [
  "Original Transfer Credentials",
  "Original Certificate of Good Moral Character",
  "PSA Birth Certificate (photocopy on submission; original must be presented)",
  "Four (4) copies of latest 2×2 ID picture, white background",
  "Two (2) pieces large brown envelopes",
  "Entrance Exam (on a case-to-case basis)",
];

export const shsRequirements = [
  "Original SF 9 (Report Card)",
  "PSA Birth Certificate",
  "Certificate of Good Moral Character or Anecdotal Record",
  "Photocopy of Completion Certificate (Grade 10)",
  "Result of NCAE or any equivalent test",
];

export const baccalaureatePrograms: Program[] = [
  {
    code: "BAMT",
    name: "Bachelor in Aircraft Maintenance Technology",
    duration: "4 years",
    description:
      "A four-year degree preparing students for licensure and careers maintaining aircraft airframes, powerplants, and systems.",
    curriculum: [
      "TODO: add approved subject list / curriculum map for BAMT",
    ],
    outcomes: [
      "Aircraft Maintenance Technician",
      "Airline maintenance & ground operations",
      "MRO (Maintenance, Repair, Overhaul) facilities",
      "Aviation quality assurance & regulatory roles",
    ],
  },
  {
    code: "BAET",
    name: "Bachelor in Aviation Electronics Technology",
    duration: "4 years",
    description:
      "A four-year degree focused on aircraft avionics, communication systems, and electronic instrumentation.",
    curriculum: [
      "TODO: add approved subject list / curriculum map for BAET",
    ],
    outcomes: [
      "Avionics Technician",
      "Airline avionics & instrumentation teams",
      "Aircraft electronics manufacturing & testing",
      "Aviation systems support roles",
    ],
  },
];

export const twoYearPrograms: Program[] = [
  {
    code: "AMT",
    name: "Aircraft Maintenance Technology",
    duration: "2 years",
    description:
      "Hands-on technical training in aircraft airframe and powerplant inspection, servicing, and repair.",
    curriculum: [
      "TODO: add approved subject list / curriculum map for AMT",
    ],
    outcomes: [
      "Aircraft mechanic / technician roles",
      "Ground maintenance crews",
      "Entry-level MRO positions",
    ],
  },
  {
    code: "AET",
    name: "Aviation Electronics Technology",
    duration: "2 years",
    description:
      "Technical training in aircraft electronics, instrumentation, and communication systems.",
    curriculum: [
      "TODO: add approved subject list / curriculum map for AET",
    ],
    outcomes: [
      "Avionics support technician",
      "Aircraft electronics assembly & testing",
      "Entry-level instrumentation roles",
    ],
  },
];

export const shsPrograms: Program[] = [
  {
    code: "STEM",
    name: "Science, Technology, Engineering, & Mathematics",
    duration: "2 years (Grades 11–12)",
    description:
      "For students pursuing engineering, aviation technology, and other science-based career paths.",
    curriculum: [
      "TODO: add STEM subject list per DepEd SHS curriculum",
    ],
    outcomes: [
      "Pathway to Baccalaureate aviation programs (BAMT, BAET)",
      "Engineering & applied sciences degree programs",
      "Technical/vocational aviation tracks",
    ],
  },
  {
    code: "ABM",
    name: "Accountancy, Business, and Management",
    duration: "2 years (Grades 11–12)",
    description:
      "Prepares students for careers and further study in business, accounting, and finance.",
    curriculum: [
      "TODO: add ABM subject list per DepEd SHS curriculum",
    ],
    outcomes: [
      "Business & accountancy degree programs",
      "Aviation business & operations tracks",
      "Entrepreneurship pathways",
    ],
  },
  {
    code: "GAS",
    name: "General Academic Strand",
    duration: "2 years (Grades 11–12)",
    description:
      "A flexible track for students still exploring their future academic and career direction.",
    curriculum: [
      "TODO: add GAS subject list per DepEd SHS curriculum",
    ],
    outcomes: [
      "Flexible entry into any college degree program",
      "General education foundation",
    ],
  },
];