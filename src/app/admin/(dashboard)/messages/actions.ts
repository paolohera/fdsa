"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleMessageRead(formData: FormData) {
  const id = formData.get("id")?.toString();
  const nextRead = formData.get("read") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("contact_messages").update({ read: nextRead }).eq("id", id);

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