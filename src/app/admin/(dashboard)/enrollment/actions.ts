"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugifyKey(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

export async function createField(formData: FormData) {
  const supabase = await createClient();

  const label = formData.get("label") as string;
  const fieldType = formData.get("field_type") as string;
  const required = formData.get("required") === "on";
  const optionsRaw = (formData.get("options") as string) ?? "";
  const options =
    fieldType === "select"
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : null;

  if (!label) {
    redirect("/admin/enrollment/fields?error=Please enter a field label.");
  }

  const { data: maxRow } = await supabase
    .from("enrollment_fields")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("enrollment_fields").insert({
    label,
    field_key: `${slugifyKey(label)}_${crypto.randomUUID().slice(0, 6)}`,
    field_type: fieldType,
    options,
    required,
    sort_order: (maxRow?.sort_order ?? -1) + 1,
  });

  if (error) {
    redirect(`/admin/enrollment/fields?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/enrollment/fields");
  revalidatePath("/enroll");
  redirect("/admin/enrollment/fields");
}

export async function updateField(id: string, formData: FormData) {
  const supabase = await createClient();

  const label = formData.get("label") as string;
  const required = formData.get("required") === "on";
  const optionsRaw = (formData.get("options") as string) ?? "";

  const { data: existing } = await supabase
    .from("enrollment_fields")
    .select("field_type")
    .eq("id", id)
    .single();

  const options =
    existing?.field_type === "select"
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : null;

  const { error } = await supabase
    .from("enrollment_fields")
    .update({ label, required, options })
    .eq("id", id);

  if (error) {
    redirect(`/admin/enrollment/fields?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/enrollment/fields");
  revalidatePath("/enroll");
  redirect("/admin/enrollment/fields");
}

export async function deleteField(id: string) {
  const supabase = await createClient();
  await supabase.from("enrollment_fields").delete().eq("id", id);
  revalidatePath("/admin/enrollment/fields");
  revalidatePath("/enroll");
}

export async function reorderFields(orderedIds: string[]) {
  const supabase = await createClient();

  // Update every field's sort_order in one pass based on its new index.
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("enrollment_fields").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/enrollment/fields");
  revalidatePath("/enroll");
}

export async function moveField(id: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: fields } = await supabase
    .from("enrollment_fields")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!fields) return;

  const index = fields.findIndex((f) => f.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= fields.length) return;

  const current = fields[index];
  const swap = fields[swapIndex];

  await supabase.from("enrollment_fields").update({ sort_order: swap.sort_order }).eq("id", current.id);
  await supabase.from("enrollment_fields").update({ sort_order: current.sort_order }).eq("id", swap.id);

  revalidatePath("/admin/enrollment/fields");
  revalidatePath("/enroll");
}

export async function updateSubmissionStatus(id: string, status: "new" | "reviewed" | "contacted") {
  const supabase = await createClient();
  await supabase
    .from("enrollment_submissions")
    .update({ status, reviewed_at: status !== "new" ? new Date().toISOString() : null })
    .eq("id", id);

  revalidatePath("/admin/enrollment");
  revalidatePath(`/admin/enrollment/${id}`);
}

export async function deleteSubmission(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enrollment_submissions").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete enrollment submission:", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/enrollment");
}