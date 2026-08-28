import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import SecretLoginModal from "@/components/secret-login-modal";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import SiteHeader from "@/components/site-header";
import FloatingChat from "@/components/floating-chat/floating-chat";
import DevNoticeGate from "@/components/dev-notice-gate";

const accreditations = [
  { src: "/logo/ched.png", alt: "Commission on Higher Education" },
  { src: "/logo/caap.png", alt: "Civil Aviation Authority of the Philippines" },
  { src: "/logo/kagawaran.png", alt: "Department of Education" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Header, modal, and chat widget live OUTSIDE SmoothScrollProvider
          deliberately — a transformed ancestor (which ScrollSmoother
          applies on desktop) breaks position:fixed for anything nested
          inside it, turning it into position:absolute relative to that
          ancestor instead. All three need to be genuinely fixed to the
          real viewport. */}
      <SiteHeader />
      <SecretLoginModal />
      <FloatingChat />
      <DevNoticeGate />

      <SmoothScrollProvider>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>

          <footer className="border-t-2 border-brass/70 bg-ink text-parchment/70">
            <div className="mx-auto max-w-5xl px-6 py-14">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {/* Brand */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/fdsa-logo.png"
                      alt="FDSA crest"
                      width={40}
                      height={40}
                    />
                    <p
                      className="text-sm leading-tight text-parchment"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Flight Dynamics
                      <br />
                      School of Aeronautics
                    </p>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-parchment/50">
                    Training aviation professionals since 1988, at Mactan-Cebu
                    International Airport.
                  </p>
                  <a
                    href="https://www.facebook.com/fdsa.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FDSA on Facebook"
                    className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-parchment/20 text-parchment/60 transition hover:border-brass hover:text-brass"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
                    </svg>
                  </a>
                </div>

                {/* Quick links */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                    Explore
                  </p>
                  <nav className="mt-4 flex flex-col gap-2.5 text-sm">
                    <Link href="/" className="w-fit transition hover:text-parchment">
                      Home
                    </Link>
                    <Link href="/about" className="w-fit transition hover:text-parchment">
                      About
                    </Link>
                    <Link href="/programs" className="w-fit transition hover:text-parchment">
                      Programs
                    </Link>
                    <Link href="/facilities" className="w-fit transition hover:text-parchment">
                      Facilities
                    </Link>
                    <Link href="/news" className="w-fit transition hover:text-parchment">
                      News
                    </Link>
                    <Link href="/contact" className="w-fit transition hover:text-parchment">
                      Contact
                    </Link>
                    <Link href="/help-centre" className="w-fit transition hover:text-parchment">
                      Help Centre
                    </Link>
                  </nav>
                </div>

                {/* Programs */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                    Programs
                  </p>
                  <nav className="mt-4 flex flex-col gap-2.5 text-sm">
                    <Link href="/programs" className="w-fit transition hover:text-parchment">
                      Baccalaureate
                    </Link>
                    <Link href="/programs" className="w-fit transition hover:text-parchment">
                      Two-Year Technical
                    </Link>
                    <Link href="/programs" className="w-fit transition hover:text-parchment">
                      Senior High School
                    </Link>
                  </nav>
                </div>

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                    Contact
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-brass/70" />
                      <span>
                        The Runway Building, Pak-Pakan Rd
                        <br />
                        Lapu-Lapu City, Cebu, Philippines
                      </span>
                    </div>
                    <a
                      href="mailto:flightdynamicsjdc@gmail.com"
                      className="flex items-center gap-2.5 transition hover:text-parchment"
                    >
                      <Mail size={16} className="shrink-0 text-brass/70" />
                      flightdynamicsjdc@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Accreditations */}
              <div className="mt-12 flex flex-col items-center gap-4 border-t border-parchment/10 pt-8 sm:flex-row sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                  Accredited By
                </p>
                <div className="flex items-center gap-5">
                  {accreditations.map((logo) => (
                    <div
                      key={logo.src}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-parchment/95 p-2 shadow-sm sm:h-20 sm:w-20"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={72}
                        height={72}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-parchment/10">
              <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-parchment/40 sm:flex-row">
                <p>&copy; {new Date().getFullYear()} Flight Dynamics School of Aeronautics, Inc.</p>
                <p>Mactan-Cebu International Airport Area &middot; Lapu-Lapu City, Cebu</p>
              </div>
            </div>
          </footer>
        </div>
      </SmoothScrollProvider>
    </>
  );
}