import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  GalleryHorizontal,
  Image as ImageIcon,
  Clock,
  Compass,
  Gem,
  Mail,
  MessageCircle,
  LogOut,
  SquareArrowOutUpRight,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import AdminNavLink from "@/components/admin/admin-nav-link";
import AdminSearch from "@/components/admin/admin-search";
import AdminTopbarTitle from "@/components/admin/admin-topbar-title";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated visitors away from /admin,
  // but the login page itself renders through this same route group without
  // a user, so bail out quietly rather than double-guarding there.
  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "viewer") {
    redirect("/admin/login?error=Your account does not have admin access yet.");
  }

  const { count: unreadMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  const { count: openChats } = await supabase
    .from("chat_conversations")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  return (
    <div className="min-h-screen bg-parchment">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-parchment/10 bg-ink">
        <div className="border-b border-parchment/10 px-6 py-8">
          <p
            className="text-xl font-bold tracking-tight text-parchment"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FDSA
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-parchment/50">
            Content Admin
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          <AdminNavLink href="/admin" label="Dashboard" icon={<LayoutDashboard size={17} strokeWidth={2} />} />
          <AdminNavLink href="/admin/news" label="News Management" icon={<Newspaper size={17} strokeWidth={2} />} />
          <AdminNavLink href="/admin/hero" label="Hero Carousel" icon={<GalleryHorizontal size={17} strokeWidth={2} />} />

          <p className="px-3 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-parchment/30">
            About Page
          </p>
          <AdminNavLink href="/admin/about" label="About Image" icon={<ImageIcon size={17} strokeWidth={2} />} />
          <AdminNavLink href="/admin/about/timeline" label="Timeline" icon={<Clock size={17} strokeWidth={2} />} />
          <AdminNavLink
            href="/admin/about/vision-mission"
            label="Vision & Mission"
            icon={<Compass size={17} strokeWidth={2} />}
          />
          <AdminNavLink href="/admin/about/values" label="Core Values" icon={<Gem size={17} strokeWidth={2} />} />

          <p className="px-3 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-parchment/30">
            Site
          </p>
          <AdminNavLink
            href="/admin/messages"
            label="Messages"
            icon={<Mail size={17} strokeWidth={2} />}
            badge={unreadMessages ?? 0}
          />
          <AdminNavLink
            href="/admin/live-chat"
            label="Live Chat"
            icon={<MessageCircle size={17} strokeWidth={2} />}
            badge={openChats ?? 0}
          />
        </nav>

        <div className="px-6 py-4">
          <Link
            href="/admin/news/new"
            className="flex w-full items-center justify-center gap-2 bg-brass px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-brass/90"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Post
          </Link>
        </div>

        <div className="border-t border-parchment/10 px-4 py-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-parchment/60 transition hover:bg-white/5 hover:text-parchment/90"
          >
            <SquareArrowOutUpRight size={17} strokeWidth={2} />
            View live site
          </a>
        </div>

        <div className="flex items-center gap-3 border-t border-parchment/10 px-6 py-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center bg-parchment/10 text-sm font-bold text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {profile.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-parchment">{profile.email}</p>
            <p className="text-[11px] capitalize text-brass">{profile.role}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="p-1.5 text-parchment/50 transition hover:text-parchment"
            >
              <LogOut size={17} strokeWidth={2} />
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-64 flex flex-col">
        {/* Top bar */}
        <header className="fixed inset-x-0 left-64 top-0 z-30 flex h-16 items-center justify-between border-b border-t-[3px] border-ink/10 border-t-brass bg-paper/80 px-8 backdrop-blur-md">
          <div className="flex flex-1 items-center gap-4">
            <AdminTopbarTitle />
            <AdminSearch />
          </div>
        </header>

        <main className="mt-16 flex-1 px-8 py-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}