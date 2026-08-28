"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDevNotice(formData: FormData) {
  const supabase = await createClient();

  const enabled = formData.get("enabled") === "on";
  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const oldSiteUrl = (formData.get("old_site_url") as string)?.trim() || null;

  if (!title || !message) {
    throw new Error("Please fill in a title and message.");
  }

  const { error } = await supabase
    .from("dev_notice")
    .update({
      enabled,
      title,
      message,
      old_site_url: oldSiteUrl,
      // Bumping this on every save is deliberate — it's what makes the
      // notice reappear for visitors who'd already dismissed an older
      // version of it.
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dev-notice");
  revalidatePath("/", "layout");
}