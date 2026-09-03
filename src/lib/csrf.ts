import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generates a CSRF token. For authenticated users, binds token to session.
 * For unauthenticated (login), uses a simple random token stored in cookie.
 */
export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const token = crypto.randomUUID();
  
  if (session) {
    // Authenticated: bind token to user session
    const hashedToken = await hashToken(token, session.user.id);
    cookieStore.set(CSRF_COOKIE_NAME, hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
  } else {
    // Unauthenticated (login): store plain token (will be verified by direct comparison)
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour for login
      path: "/",
    });
  }

  return token;
}

async function hashToken(token: string, userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + userId);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyCsrfToken(token: string | null): Promise<boolean> {
  if (!token) return false;

  const cookieStore = await cookies();
  const storedValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!storedValue) return false;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Authenticated: verify hash matches
    const computedHash = await hashToken(token, session.user.id);
    return computedHash === storedValue;
  } else {
    // Unauthenticated (login): direct comparison
    return token === storedValue;
  }
}

export async function getCsrfTokenFromHeaders(headers: Headers): Promise<string | null> {
  return headers.get(CSRF_HEADER_NAME);
}

export function csrfMiddleware() {
  return async (request: Request) => {
    const token = request.headers.get(CSRF_HEADER_NAME);
    const isValid = await verifyCsrfToken(token);
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid CSRF token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return null; // Continue
  };
}