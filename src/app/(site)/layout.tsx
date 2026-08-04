import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-4 border-double border-ink bg-parchment">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Est. 1965 · Riverside, CA
          </p>
          <Link href="/">
            <h1
              className="mt-2 text-4xl font-normal tracking-tight text-ink sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ashford University
            </h1>
          </Link>
        </div>
        <nav className="border-t border-ink/20">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-6 py-3 text-sm">
            <Link href="/" className="text-charcoal hover:text-brass">
              Home
            </Link>
            <Link href="/news" className="text-charcoal hover:text-brass">
              News
            </Link>
            <Link href="/admin/login" className="text-charcoal/50 hover:text-brass">
              Staff
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink/20 bg-ink text-parchment/70">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center text-sm">
          <p style={{ fontFamily: "var(--font-display)" }} className="text-parchment">
            Ashford University
          </p>
          <p className="mt-2">1200 Riverbend Way, Riverside, CA 92501</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Ashford University</p>
        </div>
      </footer>
    </div>
  );
}