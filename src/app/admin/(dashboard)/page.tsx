import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: newsCount } = await supabase
    .from("news_posts")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Database connection is live if the count below loaded without an error.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/news"
          className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
        >
          <p className="text-2xl font-semibold text-slate-900">
            {newsCount ?? 0}
          </p>
          <p className="mt-1 text-sm text-slate-500">News posts</p>
        </Link>
      </div>
    </div>
  );
}
