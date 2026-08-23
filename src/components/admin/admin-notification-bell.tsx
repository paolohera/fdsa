"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Mail, MessageCircle, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markMessageRead, markApplicationReviewed } from "@/lib/notifications/actions";

type RecentMessage = { id: string; name: string; message: string; created_at: string };
type RecentChat = { id: string; visitor_name: string; last_message_at: string };
type RecentApplication = { id: string; program_name: string | null; data: Record<string, string>; submitted_at: string };

type NotificationItem = {
  id: string;
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  timestamp: string;
  kind: "message" | "chat" | "application";
  sourceId: string;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function AdminNotificationBell({
  initialUnreadMessages,
  initialOpenChats,
  initialNewApplications,
  initialRecentMessages,
  initialRecentChats,
  initialRecentApplications,
}: {
  initialUnreadMessages: number;
  initialOpenChats: number;
  initialNewApplications: number;
  initialRecentMessages: RecentMessage[];
  initialRecentChats: RecentChat[];
  initialRecentApplications: RecentApplication[];
}) {
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages);
  const [openChats, setOpenChats] = useState(initialOpenChats);
  const [newApplications, setNewApplications] = useState(initialNewApplications);
  const [recentMessages, setRecentMessages] = useState(initialRecentMessages);
  const [recentChats, setRecentChats] = useState(initialRecentChats);
  const [recentApplications, setRecentApplications] = useState(initialRecentApplications);
  // Chat notifications don't have a DB "read" flag we want to flip (their
  // status legitimately stays "open" while a conversation continues), so
  // dismissed chat ids are tracked locally to hide them from the dropdown
  // and decrement the badge without touching the conversation's status.
  const [dismissedChatIds, setDismissedChatIds] = useState<Set<string>>(new Set());

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function refreshMessages() {
      const { data, count } = await supabase
        .from("contact_messages")
        .select("id, name, message, created_at", { count: "exact" })
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentMessages(data ?? []);
      setUnreadMessages(count ?? 0);
    }

    async function refreshChats() {
      const { data, count } = await supabase
        .from("chat_conversations")
        .select("id, visitor_name, last_message_at", { count: "exact" })
        .eq("status", "open")
        .order("last_message_at", { ascending: false })
        .limit(5);
      setRecentChats(data ?? []);
      setOpenChats(count ?? 0);
    }

    async function refreshApplications() {
      const { data, count } = await supabase
        .from("enrollment_submissions")
        .select("id, program_name, data, submitted_at", { count: "exact" })
        .eq("status", "new")
        .order("submitted_at", { ascending: false })
        .limit(5);
      setRecentApplications(data ?? []);
      setNewApplications(count ?? 0);
    }

    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, refreshMessages)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, refreshChats)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollment_submissions" },
        refreshApplications
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleItemClick(item: NotificationItem) {
    setOpen(false);

    if (item.kind === "message") {
      setRecentMessages((prev) => prev.filter((m) => m.id !== item.sourceId));
      setUnreadMessages((prev) => Math.max(0, prev - 1));
      markMessageRead(item.sourceId);
    } else if (item.kind === "application") {
      setRecentApplications((prev) => prev.filter((a) => a.id !== item.sourceId));
      setNewApplications((prev) => Math.max(0, prev - 1));
      markApplicationReviewed(item.sourceId);
    } else {
      // Chat: dismiss locally only, status stays "open" in the database.
      setDismissedChatIds((prev) => new Set(prev).add(item.sourceId));
      setOpenChats((prev) => Math.max(0, prev - 1));
    }
  }

  const visibleChats = recentChats.filter((c) => !dismissedChatIds.has(c.id));

  const items: NotificationItem[] = [
    ...recentMessages.map((m) => ({
      id: `msg-${m.id}`,
      href: "/admin/messages",
      icon: <Mail size={15} />,
      title: m.name,
      subtitle: m.message,
      timestamp: m.created_at,
      kind: "message" as const,
      sourceId: m.id,
    })),
    ...visibleChats.map((c) => ({
      id: `chat-${c.id}`,
      href: `/admin/live-chat/${c.id}`,
      icon: <MessageCircle size={15} />,
      title: c.visitor_name,
      subtitle: "New chat waiting for a reply",
      timestamp: c.last_message_at,
      kind: "chat" as const,
      sourceId: c.id,
    })),
    ...recentApplications.map((a) => ({
      id: `app-${a.id}`,
      href: `/admin/enrollment/${a.id}`,
      icon: <ClipboardCheck size={15} />,
      title: a.data.full_name || a.data.name || "New applicant",
      subtitle: a.program_name ?? "General application",
      timestamp: a.submitted_at,
      kind: "application" as const,
      sourceId: a.id,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = unreadMessages + openChats + newApplications;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${total} notification${total === 1 ? "" : "s"}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 transition hover:bg-ink/5 hover:text-ink"
      >
        <Bell size={18} strokeWidth={2} />
        {total > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-paper">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-xl">
          <div className="border-b border-ink/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-charcoal/50">You&apos;re all caught up.</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  className="flex items-start gap-3 border-b border-ink/5 px-4 py-3 transition last:border-b-0 hover:bg-ink/[0.03]"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass">
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                    <p className="truncate text-xs text-charcoal/60">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[11px] text-charcoal/40">
                    {timeAgo(item.timestamp)}
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 text-center text-xs">
            <Link href="/admin/messages" onClick={() => setOpen(false)} className="py-2.5 text-charcoal/60 hover:bg-ink/5 hover:text-ink">
              Messages
            </Link>
            <Link href="/admin/live-chat" onClick={() => setOpen(false)} className="py-2.5 text-charcoal/60 hover:bg-ink/5 hover:text-ink">
              Live Chat
            </Link>
            <Link href="/admin/enrollment" onClick={() => setOpen(false)} className="py-2.5 text-charcoal/60 hover:bg-ink/5 hover:text-ink">
              Enrollment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}