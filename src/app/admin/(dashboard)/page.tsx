import Link from "next/link";
import {
  Newspaper,
  GalleryHorizontal,
  Image as ImageIcon,
  Clock,
  Mail,
  MessageCircle,
  ClipboardCheck,
  SquarePlus,
  Images,
  ArrowRight,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  Database,
  Wifi,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/admin-ui";

type ActivityItem = {
  id: string;
  type: "news" | "message" | "live_chat" | "enrollment" | "hero" | "timeline" | "about" | "dev_notice";
  title: string;
  description: string;
  timestamp: string;
  link: string;
  icon: React.ReactNode;
  iconBg: string;
};

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "news":
      return { icon: <Newspaper size={14} />, iconBg: "bg-brass/15 text-brass" };
    case "message":
      return { icon: <Mail size={14} />, iconBg: "bg-blue/15 text-blue" };
    case "live_chat":
      return { icon: <MessageCircle size={14} />, iconBg: "bg-emerald/15 text-emerald" };
    case "enrollment":
      return { icon: <ClipboardCheck size={14} />, iconBg: "bg-purple/15 text-purple" };
    case "hero":
      return { icon: <Images size={14} />, iconBg: "bg-indigo/15 text-indigo" };
    case "timeline":
      return { icon: <Clock size={14} />, iconBg: "bg-orange/15 text-orange" };
    case "about":
      return { icon: <ImageIcon size={14} />, iconBg: "bg-teal/15 text-teal" };
    case "dev_notice":
      return { icon: <AlertCircle size={14} />, iconBg: "bg-red/15 text-red" };
  }
}

function formatActivityTimestamp(iso: string) {
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

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all stats in parallel
  const [
    { count: newsCount },
    { count: heroCount },
    { count: unreadMessages },
    { count: openChats },
    { data: recentNews },
    { data: recentMessages },
    { data: recentChats },
    { data: recentEnrollments },
    { data: recentTimeline },
  ] = await Promise.all([
    supabase.from("news_posts").select("*", { count: "exact", head: true }),
    supabase.from("hero_slides").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
    supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("news_posts")
      .select("id, title, published, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_messages")
      .select("id, name, email, message, created_at, read")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("chat_conversations")
      .select("id, visitor_name, status, unread_count, last_message_at")
      .order("last_message_at", { ascending: false })
      .limit(5),
    supabase
      .from("enrollment_submissions")
      .select("id, program_name, data, status, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabase
      .from("timeline_entries")
      .select("id, year, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Build unified activity feed
  const activities: ActivityItem[] = [];

  // News activity
  recentNews?.forEach((post) => {
    activities.push({
      id: `news-${post.id}`,
      type: "news",
      title: post.published ? "News post published" : "News post drafted",
      description: post.title,
      timestamp: post.created_at,
      link: `/admin/news/${post.id}`,
      ...getActivityIcon("news"),
    });
  });

  // Messages activity
  recentMessages?.forEach((msg) => {
    activities.push({
      id: `msg-${msg.id}`,
      type: "message",
      title: msg.read ? "Message read" : "New contact message",
      description: `${msg.name} — ${msg.message.slice(0, 80)}${msg.message.length > 80 ? "..." : ""}`,
      timestamp: msg.created_at,
      link: `/admin/messages`,
      ...getActivityIcon("message"),
    });
  });

  // Live chat activity
  recentChats?.forEach((chat) => {
    if (chat.unread_count && chat.unread_count > 0) {
      activities.push({
        id: `chat-${chat.id}`,
        type: "live_chat",
        title: "New live chat message",
        description: `${chat.visitor_name} (${chat.unread_count} unread)`,
        timestamp: chat.last_message_at,
        link: `/admin/live-chat/${chat.id}`,
        ...getActivityIcon("live_chat"),
      });
    }
  });

  // Enrollment activity
  recentEnrollments?.forEach((enroll) => {
    const name = enroll.data?.full_name || enroll.data?.name || "New applicant";
    activities.push({
      id: `enroll-${enroll.id}`,
      type: "enrollment",
      title: "New enrollment application",
      description: `${name} — ${enroll.program_name ?? "General"}`,
      timestamp: enroll.submitted_at,
      link: `/admin/enrollment/${enroll.id}`,
      ...getActivityIcon("enrollment"),
    });
  });

  // Timeline activity
  recentTimeline?.forEach((entry) => {
    activities.push({
      id: `timeline-${entry.id}`,
      type: "timeline",
      title: "Timeline entry added",
      description: `${entry.year} — ${entry.title}`,
      timestamp: entry.created_at,
      link: `/admin/about/timeline/${entry.id}`,
      ...getActivityIcon("timeline"),
    });
  });

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Enrollment status counts
  const { data: enrollmentStatuses } = await supabase
    .from("enrollment_submissions")
    .select("status");
  const enrollmentCounts = (enrollmentStatuses ?? []).reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Stats cards
  const stats = [
    {
      label: "News Posts",
      value: newsCount ?? 0,
      secondary: `${(recentNews?.filter((p) => p.published).length ?? 0)} published`,
      href: "/admin/news",
      icon: Newspaper,
      iconBg: "bg-brass/15 text-brass",
    },
    {
      label: "Hero Slides",
      value: heroCount ?? 0,
      secondary: "Carousel images",
      href: "/admin/hero",
      icon: GalleryHorizontal,
      iconBg: "bg-indigo/15 text-indigo",
    },
    {
      label: "Messages",
      value: unreadMessages ?? 0,
      secondary: `${recentMessages?.length ?? 0} total`,
      href: "/admin/messages",
      icon: Mail,
      iconBg: "bg-blue/15 text-blue",
    },
    {
      label: "Live Chat",
      value: openChats ?? 0,
      secondary: "Active conversations",
      href: "/admin/live-chat",
      icon: MessageCircle,
      iconBg: "bg-emerald/15 text-emerald",
    },
    {
      label: "Enrollment",
      value: enrollmentCounts.new ?? 0,
      secondary: `${enrollmentCounts.reviewed ?? 0} reviewed, ${enrollmentCounts.completed ?? 0} done`,
      href: "/admin/enrollment",
      icon: ClipboardCheck,
      iconBg: "bg-purple/15 text-purple",
    },
  ];

  const quickActions = [
    { label: "Create News Post", href: "/admin/news/new", icon: SquarePlus },
    { label: "Manage Hero Slides", href: "/admin/hero", icon: Images },
    { label: "Add Timeline Entry", href: "/admin/about/timeline/new", icon: Clock },
    { label: "View Messages", href: "/admin/messages", icon: Mail },
    { label: "Open Live Chat", href: "/admin/live-chat", icon: MessageCircle },
    { label: "Review Enrollment", href: "/admin/enrollment", icon: ClipboardCheck },
    { label: "Edit Vision & Mission", href: "/admin/about/vision-mission", icon: ImageIcon },
    { label: "Edit Core Values", href: "/admin/about/values", icon: Users },
  ];

  const latestMessage = recentMessages?.[0];
  const latestChat = recentChats?.[0];
  const latestEnrollment = recentEnrollments?.[0];

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <AdminPageHeader
        title="Dashboard"
        description="Here's what's happening with your FDSA website today."
        action={
          <div className="flex items-center gap-2 text-xs text-charcoal/50">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              System Connected
            </span>
            <span className="px-2">|</span>
            <span>Last updated: Just now</span>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <AdminCard className="group relative p-5 hover:border-brass/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-charcoal/50">
                    {stat.label}
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/40">{stat.secondary}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} transition-colors group-hover:scale-105`}>
                  <stat.icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div
                className="mt-4 text-3xl leading-none text-ink sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>

      {/* Main Grid: Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Actions + Live Chat Summary + Enrollment Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <AdminCard className="p-5">
            <h3
              className="mb-4 border-b border-ink/10 pb-3 text-lg text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between border border-ink/10 bg-parchment/40 p-3 transition hover:bg-ink/5 hover:border-brass/20"
                >
                  <div className="flex items-center gap-3">
                    <action.icon size={18} className="text-ink transition group-hover:text-brass" />
                    <span className="text-sm font-medium text-ink">{action.label}</span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-charcoal/40 opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </AdminCard>

          {/* Live Chat Summary */}
          <AdminCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
                Live Chat
              </h3>
              <AdminBadge tone={openChats && openChats > 0 ? "green" : "slate"}>
                {openChats ?? 0} active
              </AdminBadge>
            </div>

            {openChats && openChats > 0 && latestChat ? (
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 border border-ink/10 bg-parchment/40 rounded-lg">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-emerald">
                    <MessageCircle size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{latestChat.visitor_name}</p>
                    <p className="text-xs text-charcoal/50">
                      {latestChat.unread_count && latestChat.unread_count > 0
                        ? `${latestChat.unread_count} unread message${latestChat.unread_count > 1 ? "s" : ""}`
                        : "No unread messages"}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brass">
                      {formatActivityTimestamp(latestChat.last_message_at)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-ink/15 rounded-lg">
                <MessageCircle size={24} className="mx-auto mb-2 text-charcoal/20" />
                <p className="text-sm text-charcoal/50">No active conversations</p>
                <p className="mt-1 text-xs text-charcoal/40">Your live chat is currently quiet.</p>
              </div>
            )}

            <Link
              href="/admin/live-chat"
              className="block w-full text-center text-sm font-medium text-brass hover:text-brass/80 transition"
            >
              Open Live Chat →
            </Link>
          </AdminCard>

          {/* Enrollment Summary */}
          <AdminCard className="p-5">
            <h3 className="mb-4 border-b border-ink/10 pb-3 text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Enrollment Overview
            </h3>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-display)" }}>
                    {enrollmentCounts.new ?? 0}
                  </p>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Pending</p>
                </div>
                <div className="p-3 bg-brass/10 border border-brass/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-brass" style={{ fontFamily: "var(--font-display)" }}>
                    {enrollmentCounts.reviewed ?? 0}
                  </p>
                  <p className="text-xs font-medium text-brass uppercase tracking-wide">Reviewed</p>
                </div>
                <div className="p-3 bg-blue/10 border border-blue/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700" style={{ fontFamily: "var(--font-display)" }}>
                    {enrollmentCounts.completed ?? 0}
                  </p>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Completed</p>
                </div>
              </div>
            </div>

            {latestEnrollment && (
              <div className="mb-4 p-3 border border-ink/10 bg-parchment/40 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-brass">Latest Application</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {latestEnrollment.data?.full_name || latestEnrollment.data?.name || "New applicant"}
                </p>
                <p className="text-xs text-charcoal/50">{latestEnrollment.program_name ?? "General"}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brass">
                  {formatActivityTimestamp(latestEnrollment.submitted_at)}
                </p>
              </div>
            )}

            <Link
              href="/admin/enrollment"
              className="block w-full text-center text-sm font-medium text-brass hover:text-brass/80 transition"
            >
              View All Enrollments →
            </Link>
          </AdminCard>
        </div>

        {/* Right Column: Recent Activity + Message Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <AdminCard className="p-5">
            <div className="mb-4 flex items-end justify-between border-b border-ink/10 pb-3">
              <h3 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
                Recent Activity
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={32} className="mx-auto mb-3 text-charcoal/20" />
                <p className="text-sm text-charcoal/50">No recent activity</p>
                <p className="mt-1 text-xs text-charcoal/40">Activity will appear here as changes are made.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 10).map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.link}
                    className="group flex gap-3 p-3 border border-ink/5 rounded-lg transition hover:bg-ink/5 hover:border-brass/10"
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}>
                      {activity.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{activity.title}</p>
                      <p className="mt-0.5 truncate text-sm text-charcoal/60">{activity.description}</p>
                      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-brass">
                        {formatActivityTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-charcoal/30 opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-ink/10">
              <Link
                href="/admin/activity"
                className="text-sm font-medium text-brass hover:text-brass/80 transition"
              >
                View All Activity →
              </Link>
            </div>
          </AdminCard>

          {/* Message Summary */}
          <AdminCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
                Messages
              </h3>
              <AdminBadge tone={unreadMessages && unreadMessages > 0 ? "green" : "slate"}>
                {unreadMessages ?? 0} unread
              </AdminBadge>
            </div>

            {latestMessage ? (
              <div className="mb-4 p-4 border border-ink/10 bg-parchment/40 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-brass">Latest Message</p>
                <p className="mt-1 text-sm font-medium text-ink">{latestMessage.name}</p>
                <p className="mt-1 text-sm text-charcoal/60 line-clamp-2">{latestMessage.message}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-charcoal/50">
                  <span>{formatActivityTimestamp(latestMessage.created_at)}</span>
                  <span>•</span>
                  <span>{latestMessage.read ? "Read" : "Unread"}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-ink/15 rounded-lg mb-4">
                <Mail size={24} className="mx-auto mb-2 text-charcoal/20" />
                <p className="text-sm text-charcoal/50">No messages yet</p>
                <p className="mt-1 text-xs text-charcoal/40">New visitor messages will appear here.</p>
              </div>
            )}

            <Link
              href="/admin/messages"
              className="block w-full text-center text-sm font-medium text-brass hover:text-brass/80 transition"
            >
              View Messages →
            </Link>
          </AdminCard>

          {/* System Status */}
          <AdminCard className="p-5">
            <h3 className="mb-4 border-b border-ink/10 pb-3 text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-ink/10 bg-parchment/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                    <Database size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Database</p>
                    <p className="text-xs text-charcoal/50">PostgreSQL connection</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-ink/10 bg-parchment/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                    <Wifi size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Realtime</p>
                    <p className="text-xs text-charcoal/50">Supabase Realtime</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-ink/10 bg-parchment/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Website</p>
                    <p className="text-xs text-charcoal/50">Production deployment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}