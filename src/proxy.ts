import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { generalRatelimit, loginRatelimit, getClientIp } from "@/lib/rate-limit";
import { securityHeadersMiddleware } from "@/lib/security-headers";

export async function proxy(request: NextRequest) {
  // Apply security headers first
  const response = securityHeadersMiddleware();

  const ip = getClientIp(request.headers);
  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  // Stricter limit for repeated hits on the login route itself (covers GET
  // page loads too, not just the POST from the login server action — this
  // stops bots from even loading the login page in a tight loop).
  // Uses same key prefix as login action to prevent bypassing one by hitting the other.
  if (isAdminLogin) {
    const { success } = await loginRatelimit.limit(`login:${ip}`);
    if (!success) {
      return new NextResponse("Too many requests. Please slow down.", {
        status: 429,
      });
    }
  }

  // General site-wide limit — catches broad bot floods across any public
  // route. Skipped for /admin (other than /admin/login, handled above)
  // since an admin actively managing content can legitimately generate more
  // than the general threshold through normal use, and that traffic is
  // already gated by Supabase auth in updateSession below.
  if (!isAdminRoute) {
    const { success } = await generalRatelimit.limit(ip);
    if (!success) {
      return new NextResponse("Too many requests. Please slow down.", {
        status: 429,
      });
    }
  }

  // Existing Supabase session refresh + /admin route protection.
  const sessionResponse = await updateSession(request);

  // Merge headers from session response into our security headers response
  sessionResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images,
     * so the auth session stays fresh across navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};