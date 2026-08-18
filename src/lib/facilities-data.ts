export type Facility = {
  slug: string;
  name: string;
  description: string;
  highlights: string[];
};

export const facilities: Facility[] = [
  {
    slug: "aircraft-hangar",
    name: "Aircraft Hangar",
    description:
      "A working hangar where students inspect, service, and maintain airframes and powerplants on real aircraft under instructor supervision.",
    highlights: [
      "Hands-on airframe and powerplant inspection",
      "Supervised maintenance on real aircraft",
      "Used across AMT and BAMT coursework",
    ],
  },
  {
    slug: "flight-simulator-lab",
    name: "Flight Simulator Lab",
    description:
      "Simulator stations used for flight procedure training, instrument familiarization, and pre-solo preparation.",
    highlights: [
      "Instrument familiarization exercises",
      "Flight procedure and checklist practice",
      "Pre-solo preparation for flight students",
    ],
  },
  {
    slug: "engine-powerplant-workshop",
    name: "Engine & Powerplant Workshop",
    description:
      "A dedicated shop for engine teardown, overhaul, and diagnostics practice, equipped with the tools used in the field.",
    highlights: [
      "Engine teardown and reassembly practice",
      "Overhaul and diagnostics training",
      "Industry-standard tooling",
    ],
  },
  {
    slug: "avionics-electronics-lab",
    name: "Avionics & Electronics Lab",
    description:
      "Hands-on bench space for aircraft electronics, wiring, communication systems, and instrumentation coursework.",
    highlights: [
      "Aircraft wiring and circuit bench work",
      "Communication systems training",
      "Supports AET and BAET coursework",
    ],
  },
  {
    slug: "library-learning-resource-center",
    name: "Library & Learning Resource Center",
    description:
      "Reference materials, manuals, and quiet study space supporting both flight and technical program coursework.",
    highlights: [
      "Technical manuals and reference library",
      "Quiet individual and group study space",
      "Open to all program levels",
    ],
  },
  {
    slug: "classrooms-lecture-halls",
    name: "Classrooms & Lecture Halls",
    description:
      "Academic spaces for ground school, general education, and lecture-based instruction across all programs.",
    highlights: [
      "Ground school and theory instruction",
      "General education subject delivery",
      "Used across Baccalaureate, Technical, and SHS tracks",
    ],
  },
];