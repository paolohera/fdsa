"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Bell, Mail, MessageCircle, ClipboardCheck, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/notifications/actions";
import { useAdminToast } from "@/components/admin/admin-toast";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 30) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "message":
      return <Mail size={15} />;
    case "live_chat":
      return <MessageCircle size={15} />;
    case "enrollment":
      return <ClipboardCheck size={15} />;
  }
}

function getNotificationIconBg(type: Notification["type"]) {
  switch (type) {
    case "message":
      return "bg-brass/15 text-brass";
    case "live_chat":
      return "bg-emerald/15 text-emerald";
    case "enrollment":
      return "bg-blue/15 text-blue";
  }
}

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useAdminToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [notifs, count] = await Promise.all([
        getNotifications({ limit: 50 }),
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

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
    
    // Use a fixed channel name - Supabase handles reconnection internally
    const channel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => loadNotifications()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        () => loadNotifications()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime notifications channel subscribed");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.warn("Realtime channel status:", status);
        }
      });

    channelRef.current = channel;

    // Initial load
    const timer = setTimeout(loadNotifications, 0);

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadNotifications]);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications([]);
      setUnreadCount(0);
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to mark all as read", "error");
    }
  }

  async function handleNotificationClick(notification: Notification) {
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to mark as read", "error");
    }
    setOpen(false);
  }

  // Compute today/yesterday strings once per render using useMemo
  const { todayStr, yesterdayStr } = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    return { todayStr: today, yesterdayStr: yesterday };
  }, []);

  const groupedNotifications = notifications.reduce(
    (acc, n) => {
      const date = new Date(n.created_at).toDateString();
      const label = date === todayStr ? "Today" : date === yesterdayStr ? "Yesterday" : date;
      if (!acc[label]) acc[label] = [];
      acc[label].push(n);
      return acc;
    },
    {} as Record<string, Notification[]>
  );

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${unreadCount} notification${unreadCount === 1 ? "" : "s"}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 transition hover:bg-ink/5 hover:text-ink"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-none text-white ring-2 ring-paper">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-xl">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-charcoal/50">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-red-600">
                {error}
                <button
                  onClick={loadNotifications}
                  className="ml-2 text-brass hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-charcoal/50">
                No new notifications.
              </div>
            ) : (
              <>
                {Object.entries(groupedNotifications).map(([date, items]) => (
                  <div key={date}>
                    <div className="border-b border-ink/5 px-4 py-2 bg-ink/3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-charcoal/50">
                        {date}
                      </p>
                    </div>
                    {items.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                        className="flex items-start gap-3 border-b border-ink/5 px-4 py-3 transition last:border-b-0 hover:bg-ink/5"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getNotificationIconBg(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">
                            {notification.title}
                          </p>
                          <p className="truncate text-xs text-charcoal/70">
                            {notification.message}
                          </p>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-[11px] text-charcoal/40">
                          {timeAgo(notification.created_at)}
                        </span>
                        <span className="shrink-0 w-2 h-2 rounded-full bg-brass ml-1 mt-2" aria-label="Unread" />
                      </Link>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>

          {unreadCount > 0 && (
            <div className="border-t border-ink/10 p-3">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-charcoal/60 hover:text-ink"
              >
                <CheckCheck size={13} />
                Mark all as read
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 text-center text-xs">
            <Link href="/admin/messages" onClick={() => setOpen(false)} className="py-2.5 text-charcoal/60 hover:bg-ink/5 hover:text-ink">
              <Mail size={14} className="mx-auto mb-1" />
              <div>Messages</div>
            </Link>
            <Link href="/admin/live-chat" onClick={() => setOpen(false)} className="py-2.5 text-charcoal/60 hover:bg-ink/5 hover:text-ink">
              <MessageCircle size={14} className="mx-auto mb-1" />
              <div>Live Chat</div>
            </Link>
            <Link href="/admin/enrollment" onClick={() => setOpen(false)} className="py-2.5 text-charcoal/60 hover:bg-ink/5 hover:text-ink">
              <ClipboardCheck size={14} className="mx-auto mb-1" />
              <div>Enrollment</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}