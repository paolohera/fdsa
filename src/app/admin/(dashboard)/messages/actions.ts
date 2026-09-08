"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleMessageRead(formData: FormData) {
  const id = formData.get("id")?.toString();
  const nextRead = formData.get("read") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("contact_messages").update({ read: nextRead }).eq("id", id);

  // If marking as read, also mark corresponding notification as read
  if (nextRead) {
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("reference_type", "contact_message")
      .eq("reference_id", id)
      .eq("is_read", false);
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessage(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("contact_messages").delete().eq("id", id);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}