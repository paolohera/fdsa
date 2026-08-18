import Link from "next/link";
import {
  Newspaper,
  GalleryHorizontal,
  Image as ImageIcon,
  Mail,
  SquarePlus,
  Images,
  ArrowRight,
  FileEdit,
  FilePlus2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import { timeAgo } from "@/lib/time-ago";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: newsCount },
    { count: heroCount },
    { data: aboutImage },
    { data: recentPosts },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase.from("news_posts").select("*", { count: "exact", head: true }),
    supabase.from("hero_slides").select("*", { count: "exact", head: true }),
    supabase.from("about_image").select("id").maybeSingle(),
    supabase
      .from("news_posts")
      .select("id, title, published, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
  ]);

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
    {
      label: "New messages",
      value: unreadMessages ?? 0,
      href: "/admin/messages",
      icon: Mail,
    },
  ];

  const quickActions = [
    { label: "Draft New Post", href: "/admin/news/new", icon: SquarePlus },
    { label: "Update Carousel", href: "/admin/hero/new", icon: Images },
    { label: "Manage About Image", href: "/admin/about", icon: ImageIcon },
    { label: "View Messages", href: "/admin/messages", icon: Mail },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your site's content. The database connection is live if these numbers loaded without error."
      />

      {/* Stat cards */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <AdminCard className="group relative p-6 hover:border-brass/50">
              <div className="mb-8 flex items-start justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-charcoal/50">
                  {stat.label}
                </h3>
                <div className="flex h-8 w-8 items-center justify-center bg-parchment text-ink transition-colors group-hover:text-brass">
                  <stat.icon size={16} strokeWidth={2} />
                </div>
              </div>
              <div
                className="text-[42px] leading-none text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AdminCard className="h-full p-6">
            <h3
              className="mb-6 border-b border-ink/10 pb-4 text-lg text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between border border-ink/10 bg-parchment/40 p-4 transition hover:bg-ink/5"
                >
                  <div className="flex items-center gap-3">
                    <action.icon size={18} className="text-ink transition group-hover:text-brass" />
                    <span className="text-sm font-medium text-ink">{action.label}</span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-charcoal/40 opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="lg:col-span-2">
          <AdminCard className="h-full p-6">
            <div className="mb-6 flex items-end justify-between border-b border-ink/10 pb-4">
              <h3 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
                Recent Activity
              </h3>
              <span className="flex items-center gap-2 border border-ink/15 bg-parchment px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brass" />
                Live
              </span>
            </div>

            {!recentPosts || recentPosts.length === 0 ? (
              <p className="py-8 text-center text-sm text-charcoal/50">
                No news posts yet — recent activity will show up here.
              </p>
            ) : (
              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-paper bg-parchment">
                      {post.published ? (
                        <FileEdit size={15} className="text-ink" />
                      ) : (
                        <FilePlus2 size={15} className="text-ink" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {post.published ? "News post published" : "News post drafted"}
                      </p>
                      <p className="mt-1 truncate text-sm text-charcoal/60">
                        &ldquo;{post.title}&rdquo;
                      </p>
                      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-brass">
                        {timeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}