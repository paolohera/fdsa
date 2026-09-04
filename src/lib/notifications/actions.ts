"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, sanitizeError } from "@/lib/admin-auth";

export async function markMessageRead(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", id);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/messages");
}

export async function markAllMessagesRead() {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("contact_messages").update({ read: true }).eq("read", false);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/messages");
}

export async function markApplicationReviewed(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("enrollment_submissions")
    .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/enrollment");
  revalidatePath(`/admin/enrollment/${id}`);
}

export async function markAllApplicationsReviewed() {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("enrollment_submissions")
    .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
    .eq("status", "new");
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/enrollment");
}