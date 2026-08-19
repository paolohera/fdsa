"use server";
 
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
 
export async function updateCoreValue(id: string, formData: FormData) {
  const supabase = await createClient();
 
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
 
  const { error } = await supabase
    .from("core_values")
    .update({ title, body })
    .eq("id", id);
 
  if (error) {
    redirect(`/admin/about/values?error=${encodeURIComponent(error.message)}`);
  }
 
  revalidatePath("/admin/about/values");
  revalidatePath("/about");
  redirect("/admin/about/values?saved=1");
}
 