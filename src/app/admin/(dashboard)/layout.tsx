import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  GalleryHorizontal,
  Images,
  GraduationCap,
  Construction,
  Image as ImageIcon,
  Clock,
  Compass,
  Gem,
  Mail,
  MessageCircle,
  ClipboardCheck,
  SquareArrowOutUpRight,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import AdminNavLink from "@/components/admin/admin-nav-link";
import AdminSearch from "@/components/admin/admin-search";
import AdminTopbarTitle from "@/components/admin/admin-topbar-title";
import AdminNotificationBell from "@/components/admin/admin-notification-bell";
import AdminLogoutButton from "@/components/admin/admin-logout-button";
import AdminMobileSidebarToggle from "@/components/admin/admin-mobile-sidebar-toggle";
import { AdminToastProvider } from "@/components/admin/admin-toast";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { SidebarCollapseToggle } from "@/components/admin/sidebar-collapse-toggle";

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

  // Get individual unread counts for sidebar badges
  const [
    { count: unreadMessages },
    { count: openChats },
    { count: newApplications },
  ] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
    supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .gt("unread_count", 0),
    supabase
      .from("enrollment_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  // Sidebar header (fixed, non-scrollable)
  const sidebarHeader = (
    <div className="border-b border-parchment/10 px-6 py-8 flex-shrink-0">
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
  );

  // Sidebar navigation (scrollable)
  const sidebarNav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
      <AdminNavLink href="/admin" label="Dashboard" icon={<LayoutDashboard size={17} strokeWidth={2} />} />
      <AdminNavLink href="/admin/news" label="News Management" icon={<Newspaper size={17} strokeWidth={2} />} matchNested />
      <AdminNavLink href="/admin/hero" label="Hero Section" icon={<GalleryHorizontal size={17} strokeWidth={2} />} />
      <AdminNavLink href="/admin/programs" label="Program Images" icon={<Images size={17} strokeWidth={2} />} />
      <AdminNavLink href="/admin/what-we-offer" label="What We Offer" icon={<GraduationCap size={17} strokeWidth={2} />} />

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
        href="/admin/dev-notice"
        label="Development Notice"
        icon={<Construction size={17} strokeWidth={2} />}
      />
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
<AdminNavLink
          href="/admin/enrollment"
          label="Enrollment"
          icon={<ClipboardCheck size={17} strokeWidth={2} />}
          badge={newApplications ?? 0}
          matchNested
        />
        <AdminNavLink
          href="/admin/facilities"
          label="Facilities"
          icon={<Images size={17} strokeWidth={2} />}
        />
      </nav>
  );

  // Sidebar footer (fixed at bottom) - New Post button + View live site
  const sidebarFooter = (
    <>
      <div className="px-6 py-4 border-t border-parchment/10 flex-shrink-0">
        <Link
          href="/admin/news/new"
          className="flex w-full items-center justify-center gap-2 bg-brass px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-brass/90"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Post
        </Link>
      </div>

      <div className="border-t border-parchment/10 px-4 py-4 flex-shrink-0">
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
    </>
  );

  // Top bar profile section (moved from sidebar footer)
  const topBarProfile = (
    <div className="flex items-center gap-3 ml-4 border-l border-ink/10 pl-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-parchment/10 text-sm font-bold text-brass"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {profile.email?.[0]?.toUpperCase() ?? "A"}
      </div>
      <div className="hidden sm:block min-w-0">
        <p className="truncate text-xs font-semibold text-ink">{profile.email}</p>
        <p className="text-[11px] capitalize text-brass">{profile.role}</p>
      </div>
      <AdminLogoutButton logoutAction={logout} />
    </div>
  );

  // Mobile drawer content (includes profile at bottom)
  const mobileDrawerContent = (
    <>
      {sidebarHeader}
      {sidebarNav}
      {sidebarFooter}
      <div className="flex items-center gap-3 border-t border-parchment/10 px-6 py-4 flex-shrink-0">
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
        <AdminLogoutButton logoutAction={logout} />
      </div>
    </>
  );

  return (
    <AdminToastProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-parchment">
          {/* Desktop sidebar — fixed rail, hidden below lg */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-parchment/10 bg-ink lg:flex transition-all duration-300 ease-out">
            <div className="flex flex-col h-full">
              {sidebarHeader}
              {sidebarNav}
              {sidebarFooter}
            </div>
          </aside>

          {/* Content */}
          <div className="flex flex-col lg:ml-64 transition-all duration-300 ease-out">
            {/* Top bar */}
            <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-t-[3px] border-ink/10 border-t-brass bg-paper/80 px-4 backdrop-blur-md sm:px-8 lg:left-64 transition-all duration-300 ease-out">
              <div className="flex flex-1 items-center gap-3 sm:gap-4">
                <AdminMobileSidebarToggle>
                  {mobileDrawerContent}
                </AdminMobileSidebarToggle>
                <SidebarCollapseToggle />
                <AdminTopbarTitle />
                <AdminSearch />
              </div>
              <div className="flex items-center gap-2">
                <AdminNotificationBell />
                {topBarProfile}
              </div>
            </header>

            <main className="mt-16 flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminToastProvider>
  );
}