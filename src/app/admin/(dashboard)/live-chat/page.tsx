import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminCard, AdminBadge, AdminEmptyState } from "@/components/admin/admin-ui";
import { timeAgo } from "@/lib/time-ago";

export const dynamic = "force-dynamic";

export default async function LiveChatListPage() {
  const supabase = await createClient();

  const { data: conversations, error } = await supabase
    .from("chat_conversations")
    .select("id, visitor_name, status, last_message_at, created_at")
    .order("last_message_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="Live Chat"
        description="Conversations started from the floating chat widget on the site."
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {conversations?.length === 0 ? (
        <AdminEmptyState>No conversations yet.</AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-ink/10">
          {conversations?.map((c) => (
            <Link
              key={c.id}
              href={`/admin/live-chat/${c.id}`}
              className="flex items-center gap-4 p-4 transition hover:bg-ink/[0.02]"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{c.visitor_name}</p>
                <p className="mt-1 text-xs text-charcoal/40">
                  Last message {timeAgo(c.last_message_at)}
                </p>
              </div>
              <AdminBadge tone={c.status === "open" ? "green" : "slate"}>
                {c.status === "open" ? "Open" : "Closed"}
              </AdminBadge>
            </Link>
          ))}
        </AdminCard>
      )}
    </div>
  );
}