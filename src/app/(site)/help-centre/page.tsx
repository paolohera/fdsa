"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  category: string;
  items: FaqItem[];
};

const faqGroups: FaqGroup[] = [
  {
    category: "Admissions",
    items: [
      {
        question: "What are the admission requirements?",
        answer:
          "Requirements vary by program level (Senior High School, Two-Year Technical, or Baccalaureate). In general, you'll need your previous school's report card or diploma, a valid ID, and completed application form. Reach out through our Contact page and we'll walk you through what's needed for your specific program.",
      },
      {
        question: "When does enrollment open?",
        answer:
          "Enrollment periods are announced on our News & Events page ahead of each term. Check there for the current schedule, or contact us directly to ask about upcoming intake dates.",
      },
      {
        question: "Do you accept transferees or shifters?",
        answer:
          "Yes, transferees and program shifters are evaluated on a case-by-case basis, depending on credits and coursework already completed. Get in touch with our admissions team for an evaluation.",
      },
    ],
  },
  {
    category: "Programs",
    items: [
      {
        question: "What programs does FDSA offer?",
        answer:
          "We offer Baccalaureate degrees (BAMT, BAET), Two-Year Technical programs (AMT, AET), and Senior High School strands (ABM, STEM, GAS). Visit the Programs page for full details on each track.",
      },
      {
        question: "Are your programs government-recognized?",
        answer:
          "Yes. Our Baccalaureate programs are approved by CHED, our Two-Year Technical programs by CAAP, and our Senior High School strands by DepEd. FDSA also maintains continuing recognition from CAAP.",
      },
    ],
  },
  {
    category: "Campus & Facilities",
    items: [
      {
        question: "Where is the campus located?",
        answer:
          "FDSA is located at Mactan-Cebu International Airport (MCIAA), Pajac, Lapu-Lapu City, Cebu. Full address details are on our Contact page.",
      },
      {
        question: "Can I visit the campus before enrolling?",
        answer:
          "Yes, campus visits can be arranged. Reach out through our Contact page and we'll help coordinate a time that works.",
      },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span
          className="text-sm font-semibold text-ink sm:text-base"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-brass transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-6 text-charcoal/75">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpCentrePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        {/* Background photo — swap the path below for a relevant campus photo. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/help-centre-hero.jpg)" }}
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
            Support
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Help Centre
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
            Answers to common questions about admissions, programs, and campus
            life at FDSA.
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-12">
          {faqGroups.map((group) => (
            <ScrollReveal key={group.category}>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {group.category}
              </h2>
              <div className="mt-3 border-t border-ink/10">
                {group.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-16 border border-ink/15 bg-paper p-6 text-center sm:p-8">
          <h2
            className="text-xl text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Still need help?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-charcoal/70">
            If you didn't find what you're looking for, reach out directly and
            the FDSA team will get back to you.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center justify-center bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-parchment transition hover:bg-ink/90"
          >
            Contact Us
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}