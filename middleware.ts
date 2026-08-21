import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { generalRatelimit, loginRatelimit, getClientIp } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { pathname } = request.nextUrl;

  // Stricter limit for repeated hits on the login route itself (covers GET
  // page loads too, not just the POST from the login server action — this
  // stops bots from even loading the login page in a tight loop).
  if (pathname === "/admin/login") {
    const { success } = await loginRatelimit.limit(`page:${ip}`);
    if (!success) {
      return new NextResponse("Too many requests. Please slow down.", {
        status: 429,
      });
    }
  }

  // General site-wide limit — catches broad bot floods across any route.
  const { success } = await generalRatelimit.limit(ip);
  if (!success) {
    return new NextResponse("Too many requests. Please slow down.", {
      status: 429,
    });
  }

  // Existing Supabase session refresh + /admin route protection.
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static metadata files)
     * - common image/font file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};