"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/verify-turnstile";
import { loginRatelimit, getClientIp } from "@/lib/rate-limit";

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("Invalid login credentials") || message.includes("Email not confirmed")) {
      return message;
    }
  }
  return "An error occurred. Please try again.";
}

export async function login(formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { success } = await loginRatelimit.limit(`login:${ip}`);
  if (!success) {
    redirect(`/admin/login?error=${encodeURIComponent("Too many attempts. Please wait a minute and try again.")}`);
  }

  const turnstileToken = formData.get("turnstileToken") as string | null;
  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    redirect(`/admin/login?error=${encodeURIComponent("Verification failed. Please try again.")}`);
  }

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(sanitizeError(error))}`);
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  redirect("/");
}

// Used by the spacebar-triggered login modal. Unlike `login`, this never
// redirects on failure — it returns a result so the modal can show the
// error inline without navigating the page.
export async function loginModal(
  formData: FormData
): Promise<{ error?: string }> {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { success } = await loginRatelimit.limit(`login:${ip}`);
  if (!success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const turnstileToken = formData.get("turnstileToken") as string | null;
  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    return { error: "Verification failed. Please try again." };
  }

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: sanitizeError(error) };
  }

  revalidatePath("/admin", "layout");
  return {};
}