import Image from "next/image";
import Link from "next/link";
import SecretLoginModal from "@/components/secret-login-modal";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SecretLoginModal />
      <header className="border-b-4 border-double border-ink bg-parchment">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/fdsa-logo.png"
              alt="FDSA crest"
              width={88}
              height={88}
              className="mx-auto"
              priority
            />
          </Link>
          <p
            className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Est. 1988 · Mactan-Cebu International Airport Area
          </p>
          <Link href="/">
            <h1
              className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Flight Dynamics School of Aeronautics Inc.
            </h1>
          </Link>
        </div>
        <nav className="border-t border-ink/20">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-6 py-3 text-sm">
            <Link href="/" className="text-charcoal hover:text-brass">
              HOME
            </Link>
            <Link href="/about" className="text-charcoal hover:text-brass">
              ABOUT
            </Link>
            <Link href="/programs" className="text-charcoal hover:text-brass">
              PROGRAMS
            </Link>
            <Link href="/news" className="text-charcoal hover:text-brass">
              NEWS
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink/20 bg-ink text-parchment/70">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center text-sm">
          <Image
            src="/fdsa-logo.png"
            alt="FDSA crest"
            width={44}
            height={44}
            className="mx-auto opacity-90"
          />
          <p style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-parchment">
            Flight Dynamics School of Aeronautics, Inc.
          </p>
          <p className="mt-2">
            Mactan-Cebu International Airport Area, Lapu-Lapu City, Cebu, Philippines
          </p>
          <p className="mt-1">
            flightdynamicsjdc@gmail.com &middot; Facebook: @fdsa.edu / @fdsallc
          </p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Flight Dynamics School of Aeronautics, Inc.</p>
        </div>
      </footer>
    </div>
  );
}