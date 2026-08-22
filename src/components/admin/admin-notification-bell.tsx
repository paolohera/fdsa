"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminNotificationBell({
  initialUnreadMessages,
  initialOpenChats,
}: {
  initialUnreadMessages: number;
  initialOpenChats: number;
}) {
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages);
  const [openChats, setOpenChats] = useState(initialOpenChats);

  useEffect(() => {
    const supabase = createClient();

    // Re-fetch exact counts on any change rather than trusting the payload
    // shape — inserts/updates/deletes all need to resolve to a fresh count,
    // and re-querying is simpler and more reliable than diffing manually.
    async function refreshMessageCount() {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      setUnreadMessages(count ?? 0);
    }

    async function refreshChatCount() {
      const { count } = await supabase
        .from("chat_conversations")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      setOpenChats(count ?? 0);
    }

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        refreshMessageCount
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        refreshChatCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const total = unreadMessages + openChats;

  return (
    <Link
      href="/admin/messages"
      aria-label={`${total} notification${total === 1 ? "" : "s"}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 transition hover:bg-ink/5 hover:text-ink"
    >
      <Bell size={18} strokeWidth={2} />
      {total > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-paper">
          {total > 9 ? "9+" : total}
        </span>
      )}
    </Link>
  );
}