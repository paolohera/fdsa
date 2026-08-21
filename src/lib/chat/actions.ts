"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/verify-turnstile";
import { chatStartRatelimit, chatMessageRatelimit, getClientIp } from "@/lib/rate-limit";

const MAX_MESSAGE_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 30_000; // 30 seconds
const RATE_LIMIT_MAX_MESSAGES = 6; // more than this in the window = auto-ban

type ActionResult = { ok: true } | { ok: false; error: string };

async function isBanned(supabase: Awaited<ReturnType<typeof createClient>>, visitorId: string) {
  const { data } = await supabase
    .from("chat_banned_visitors")
    .select("visitor_id")
    .eq("visitor_id", visitorId)
    .maybeSingle();
  return !!data;
}

// Auto-bans a visitor who's sending messages faster than a human plausibly
// would. Returns true if the visitor was just banned (caller should stop).
async function checkAndApplyRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  visitorId: string
) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("chat_messages")
    .select("id, chat_conversations!inner(visitor_id)", { count: "exact", head: true })
    .eq("chat_conversations.visitor_id", visitorId)
    .eq("sender", "visitor")
    .gte("created_at", since);

  if ((count ?? 0) >= RATE_LIMIT_MAX_MESSAGES) {
    await supabase.from("chat_banned_visitors").insert({
      visitor_id: visitorId,
      reason: "Automatic: exceeded message rate limit",
    });
    return true;
  }

  return false;
}

export async function startConversation(
  visitorId: string,
  visitorName: string,
  honeypot: string,
  turnstileToken: string
): Promise<ActionResult & { conversationId?: string }> {
  // Honeypot: real visitors never see or fill this field. A filled value
  // means a bot is blindly submitting every field it finds.
  if (honeypot) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { success } = await chatStartRatelimit.limit(ip);
  if (!success) {
    return { ok: false, error: "Too many chats started. Please wait a bit and try again." };
  }

  const isHuman = await verifyTurnstile(turnstileToken, ip);
  if (!isHuman) {
    return { ok: false, error: "Verification failed. Please try again." };
  }

  const name = visitorName.trim().slice(0, 100);
  if (!name) {
    return { ok: false, error: "Please enter your name." };
  }

  const supabase = await createClient();

  if (await isBanned(supabase, visitorId)) {
    return { ok: false, error: "This chat is unavailable." };
  }

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({ visitor_id: visitorId, visitor_name: name })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Couldn't start the chat. Please try again." };
  }

  return { ok: true, conversationId: data.id };
}

export async function sendVisitorMessage(
  conversationId: string,
  visitorId: string,
  body: string,
  honeypot: string
): Promise<ActionResult> {
  if (honeypot) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  // IP-based backstop, layered on top of the per-visitor_id DB rate limit
  // below — catches abuse that rotates visitor_id (e.g. clearing
  // localStorage) but stays on the same connection.
  const { success } = await chatMessageRatelimit.limit(ip);
  if (!success) {
    return { ok: false, error: "You're sending messages too quickly. Please slow down." };
  }

  const text = body.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) {
    return { ok: false, error: "Message can't be empty." };
  }

  const supabase = await createClient();

  if (await isBanned(supabase, visitorId)) {
    return { ok: false, error: "This chat is unavailable." };
  }

  const justBanned = await checkAndApplyRateLimit(supabase, visitorId);
  if (justBanned) {
    return { ok: false, error: "You're sending messages too quickly. This chat has been closed." };
  }

  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    sender: "visitor",
    body: text,
  });

  if (error) {
    // TEMP DEBUG — remove this console.error once the real cause is found.
    console.error("sendVisitorMessage insert failed:", error);
    return { ok: false, error: "Couldn't send your message. Please try again." };
  }

  await supabase
    .from("chat_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { ok: true };
}

export async function sendAdminReply(
  conversationId: string,
  body: string
): Promise<ActionResult> {
  const text = body.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) {
    return { ok: false, error: "Message can't be empty." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    sender: "admin",
    body: text,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase
    .from("chat_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/admin/live-chat");
  return { ok: true };
}

export async function banVisitorFromConversation(
  conversationId: string,
  visitorId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase.from("chat_banned_visitors").insert({
    visitor_id: visitorId,
    reason: "Manually banned by admin",
  });

  await supabase
    .from("chat_conversations")
    .update({ status: "closed" })
    .eq("id", conversationId);

  revalidatePath("/admin/live-chat");
  return { ok: true };
}

export async function closeConversation(conversationId: string): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", conversationId);

  revalidatePath("/admin/live-chat");
  return { ok: true };
}