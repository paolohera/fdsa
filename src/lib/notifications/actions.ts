"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin, sanitizeError } from "@/lib/admin-auth";
import { verifyCsrfToken, getCsrfTokenFromHeaders } from "@/lib/csrf";

async function verifyCsrf(): Promise<boolean> {
  const headersList = await headers();
  const token = await getCsrfTokenFromHeaders(headersList);
  return verifyCsrfToken(token);
}

export async function markMessageRead(id: string) {
  const csrfValid = await verifyCsrf();
  if (!csrfValid) throw new Error("Invalid request. Please refresh and try again.");

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", id);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/messages");
}

export async function markApplicationReviewed(id: string) {
  const csrfValid = await verifyCsrf();
  if (!csrfValid) throw new Error("Invalid request. Please refresh and try again.");

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("enrollment_submissions")
    .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/enrollment");
  revalidatePath(`/admin/enrollment/${id}`);
}