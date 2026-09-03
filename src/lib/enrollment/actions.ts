"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/verify-turnstile";
import { enrollRatelimit, getClientIp } from "@/lib/rate-limit";
import { verifyCsrfToken, getCsrfTokenFromHeaders } from "@/lib/csrf";

export type EnrollFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function sanitizeError(error: unknown): string {
  console.error("Enrollment error:", error);
  return "Something went wrong. Please try again.";
}

async function verifyCsrf(formData: FormData, headersList: Headers): Promise<boolean> {
  const token = await getCsrfTokenFromHeaders(headersList) ?? formData.get("csrf_token")?.toString() ?? null;
  return verifyCsrfToken(token);
}

export async function submitEnrollment(
  _prevState: EnrollFormState,
  formData: FormData
): Promise<EnrollFormState> {
  const honeypot = formData.get("company")?.toString() ?? "";
  if (honeypot) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { success } = await enrollRatelimit.limit(ip);
  if (!success) {
    return { status: "error", message: "Too many submissions. Please wait a minute and try again." };
  }

  const turnstileToken = formData.get("turnstileToken")?.toString() ?? null;
  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    return { status: "error", message: "Verification failed. Please try again." };
  }

  const csrfValid = await verifyCsrf(formData, headersList);
  if (!csrfValid) {
    return { status: "error", message: "Invalid request. Please refresh and try again." };
  }

  const programCode = formData.get("program_code")?.toString() || null;
  const programName = formData.get("program_name")?.toString() || null;
  const track = formData.get("track")?.toString() || null;

  const supabase = await createClient();

  const { data: fields } = await supabase
    .from("enrollment_fields")
    .select("field_key, label, required");

  const data: Record<string, string> = {};
  for (const field of fields ?? []) {
    const value = formData.get(field.field_key)?.toString().trim() ?? "";
    if (field.required && !value) {
      return { status: "error", message: `Please fill in "${field.label}".` };
    }
    if (value) data[field.field_key] = value;
  }

  const { error } = await supabase.from("enrollment_submissions").insert({
    program_code: programCode,
    program_name: programName,
    track,
    data,
  });

  if (error) {
    return { status: "error", message: sanitizeError(error) };
  }

  return {
    status: "success",
    message: "Application received — thanks for applying! Our admissions team will reach out soon.",
  };
}