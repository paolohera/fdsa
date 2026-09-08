import { createServerClient } from "@supabase/ssr";

/**
 * Supabase client for use in static generation (generateStaticParams, etc.)
 * Does not use cookies, suitable for build-time data fetching.
 */
export async function createStaticClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for static generation
        },
      },
    }
  );
}