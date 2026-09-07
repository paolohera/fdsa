"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, sanitizeError } from "@/lib/admin-auth";

export interface Notification {
  id: string;
  type: "message" | "live_chat" | "enrollment";
  title: string;
  message: string;
  link: string;
  reference_id: string;
  reference_type: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export async function getNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<Notification[]> {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("notifications")
    .select("id, type, title, message, link, reference_id, reference_type, is_read, created_at, read_at")
    .order("created_at", { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq("is_read", false);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(sanitizeError(error));

  return (data ?? []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const { supabase } = await requireAdmin();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  if (error) throw new Error(sanitizeError(error));

  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin");
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .in("id", ids);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin");
}

export async function markAllNotificationsRead(): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("is_read", false);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin");
}

export async function deleteNotification(id: string): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin");
}