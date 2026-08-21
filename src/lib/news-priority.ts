export const PRIORITY_RANK: Record<string, number> = {
  pinned: 0,
  featured: 1,
  normal: 2,
};

// Supabase can't easily order by a custom enum rank in a single query
// without a Postgres function, so we sort client-side after fetching:
// pinned first, then featured, then normal — each group by created_at desc
// (already true from the initial query order).
export function sortByPriority<T extends { priority?: string | null; created_at: string }>(
  posts: T[]
): T[] {
  return [...posts].sort((a, b) => {
    const rankDiff = (PRIORITY_RANK[a.priority ?? "normal"] ?? 2) - (PRIORITY_RANK[b.priority ?? "normal"] ?? 2);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}