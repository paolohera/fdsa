"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markMessageRead(id: string) {
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ read: true }).eq("id", id);
  revalidatePath("/admin/messages");
}

export async function markApplicationReviewed(id: string) {
  const supabase = await createClient();
  await supabase
    .from("enrollment_submissions")
    .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/enrollment");
  revalidatePath(`/admin/enrollment/${id}`);
}