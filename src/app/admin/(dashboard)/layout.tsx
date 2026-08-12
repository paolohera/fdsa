import { redirect } from "next/navigation";
import { LayoutDashboard, Newspaper, GalleryHorizontal, Image as ImageIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import AdminNavLink from "@/components/admin/admin-nav-link";

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-ink">
        <div className="px-5 py-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FDSA
          </p>
          <p className="mt-0.5 text-sm text-parchment/70">Content Admin</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <AdminNavLink href="/admin" label="Dashboard" icon={<LayoutDashboard size={17} strokeWidth={2} />} />
          <AdminNavLink href="/admin/news" label="News" icon={<Newspaper size={17} strokeWidth={2} />} />
          <AdminNavLink href="/admin/hero" label="Hero Carousel" icon={<GalleryHorizontal size={17} strokeWidth={2} />} />
          <AdminNavLink href="/admin/about" label="About Image" icon={<ImageIcon size={17} strokeWidth={2} />} />
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="rounded-md px-3 py-2">
            <p className="truncate text-xs text-parchment/50">{profile.email}</p>
            <p className="text-xs capitalize text-brass">{profile.role}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-parchment/60 transition hover:bg-white/5 hover:text-parchment/90"
            >
              <LogOut size={17} strokeWidth={2} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-60 flex-1">
        <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
      </div>
    </div>
  );
}