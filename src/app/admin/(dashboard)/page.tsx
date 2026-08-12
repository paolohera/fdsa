import Link from "next/link";
import { Newspaper, GalleryHorizontal, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: newsCount } = await supabase
    .from("news_posts")
    .select("*", { count: "exact", head: true });

  const { count: heroCount } = await supabase
    .from("hero_slides")
    .select("*", { count: "exact", head: true });

  const { data: aboutImage } = await supabase
    .from("about_image")
    .select("id")
    .maybeSingle();

  const stats = [
    {
      label: "News posts",
      value: newsCount ?? 0,
      href: "/admin/news",
      icon: Newspaper,
    },
    {
      label: "Hero slides",
      value: heroCount ?? 0,
      href: "/admin/hero",
      icon: GalleryHorizontal,
    },
    {
      label: "About image",
      value: aboutImage ? "Set" : "Not set",
      href: "/admin/about",
      icon: ImageIcon,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your site's content. The database connection is live if these numbers loaded without error."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <AdminCard className="p-5 transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <stat.icon size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </AdminCard>
          </Link>
        ))}
      </div>
    </div>
  );
}