import { Mail, MapPin } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        {/* Background photo — swap the path below for a campus/contact-relevant photo. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/contact-hero.jpg)" }}
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
            Get in Touch
          </p>
          <h1
            className="mt-2 text-4xl text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-parchment/70">
            Questions about admissions, programs, or campus visits — reach out
            and the FDSA team will get back to you.
          </p>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-14">
          {/* Contact details */}
          <ScrollReveal x={-40} y={0}>
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reach Us
            </p>
            <h2
              className="mt-2 text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Visit or write to us
            </h2>

            <div className="mt-6 space-y-5 text-sm text-charcoal/80">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-brass" />
                <span>
                  The Runway Building, Pak-Pakan Rd
                  <br />
                  Lapu-Lapu City, Cebu, Philippines
                </span>
              </div>

              <a
                href="mailto:flightdynamicsjdc@gmail.com"
                className="flex items-center gap-3 transition hover:text-ink"
              >
                <Mail size={18} className="shrink-0 text-brass" />
                flightdynamicsjdc@gmail.com
              </a>

              <a
                href="https://www.facebook.com/fdsa.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-ink"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="shrink-0 text-brass"
                >
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
                </svg>
                facebook.com/fdsa.edu
              </a>
            </div>
          </ScrollReveal>

          {/* Quick contact — mailto-based, no backend required */}
          <ScrollReveal x={40} y={0} delay={0.15}>
            <div className="border border-ink/15 bg-paper p-6 sm:p-8">
              <h2
                className="text-xl text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Send a Message
              </h2>
              <p className="mt-2 text-xs leading-5 text-charcoal/60">
                This opens your email app with the message pre-filled — send it
                from there and it'll reach us directly.
              </p>

              <form
                action="mailto:flightdynamicsjdc@gmail.com"
                method="GET"
                encType="text/plain"
                className="mt-6 flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold uppercase tracking-wide text-ink/70"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reply-to"
                    className="text-xs font-semibold uppercase tracking-wide text-ink/70"
                  >
                    Your Email
                  </label>
                  <input
                    id="reply-to"
                    name="reply-to"
                    type="email"
                    required
                    className="mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
                  />
                </div>

                <div>
                  <label
                    htmlFor="body"
                    className="text-xs font-semibold uppercase tracking-wide text-ink/70"
                  >
                    Message
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    rows={4}
                    required
                    className="mt-1.5 w-full resize-none border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-parchment transition hover:bg-ink/90"
                >
                  Open in Email App
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}