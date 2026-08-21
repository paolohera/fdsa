"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/verify-turnstile";
import { contactRatelimit, getClientIp } from "@/lib/rate-limit";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { success } = await contactRatelimit.limit(ip);
  if (!success) {
    return {
      status: "error",
      message: "Too many messages sent. Please wait a minute before trying again.",
    };
  }

  const turnstileToken = formData.get("turnstileToken")?.toString() ?? null;
  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    return {
      status: "error",
      message: "Verification failed. Please try again.",
    };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    console.error("Contact form insert failed:", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again.",
    };
  }

  return {
    status: "success",
    message: "Message sent — thanks for reaching out. We'll get back to you soon.",
  };
}