import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import SecretLoginModal from "@/components/secret-login-modal";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import HeaderIntro from "@/components/header-intro";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="flex min-h-screen flex-col">
        <SecretLoginModal />
        <header className="border-b-4 border-double border-ink bg-parchment">
          <HeaderIntro>
            <div className="mx-auto max-w-5xl px-6 py-8 text-center">
              <Link href="/" className="inline-block">
                <Image
                  data-animate
                  src="/fdsa-logo.png"
                  alt="FDSA crest"
                  width={88}
                  height={88}
                  className="mx-auto"
                  priority
                />
              </Link>
              <p
                data-animate
                className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Est. 1988 · Mactan-Cebu International Airport Area
              </p>
              <Link href="/">
                <h1
                  data-animate
                  className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Flight Dynamics School of Aeronautics
                </h1>
              </Link>
            </div>
            <nav className="border-t border-ink/20">
              <div
                data-animate
                className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-6 py-3 text-sm"
              >
                <Link href="/" className="text-charcoal hover:text-brass">
                  Home
                </Link>
                <Link href="/about" className="text-charcoal hover:text-brass">
                  About
                </Link>
                <Link href="/programs" className="text-charcoal hover:text-brass">
                  Programs
                </Link>
                <Link href="/news" className="text-charcoal hover:text-brass">
                  News
                </Link>
              </div>
            </nav>
          </HeaderIntro>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t-4 border-double border-brass/30 bg-ink text-parchment/70">
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
                  <Link href="/news" className="w-fit transition hover:text-parchment">
                    News
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
  );
}