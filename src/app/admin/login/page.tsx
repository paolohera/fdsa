import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FDSA Content Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Sign in</h1>
        </div>

        <form
          action={login}
          className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-parchment/80"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-parchment/30 focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-parchment/80"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-parchment/30 focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-brass px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brass/90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-parchment/40">
          Accounts are created in the Supabase dashboard for now — no public
          signup.
        </p>
      </div>
    </div>
  );
}