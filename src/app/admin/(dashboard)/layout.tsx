import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";

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
    console.log("DEBUG admin check: no user found on request");
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-900">
              University CMS
            </span>
           <nav className="flex gap-4 text-sm text-slate-500">
              <Link href="/admin" className="hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/admin/news" className="hover:text-slate-900">
                News
              </Link>
              <Link href="/admin/hero" className="hover:text-slate-900">
                Hero Carousel
              </Link>
              <Link href="/admin/about" className="hover:text-slate-900">
                About Image
              </Link>
           
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>
              {profile.email} · <span className="capitalize">{profile.role}</span>
            </span>
            <form action={logout}>
              <button type="submit" className="text-slate-500 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}