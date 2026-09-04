import { createClient } from "@/lib/supabase/server";
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
} from "@/components/admin/admin-ui";
import MessageRow from "./message-row";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, created_at, read")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Submissions from the site's Contact page."
      />

      {!messages || messages.length === 0 ? (
        <AdminEmptyState>
          No messages yet — submissions from the Contact page will show up
          here.
        </AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-ink/10">
          {messages.map((msg) => (
            <MessageRow key={msg.id} msg={msg} />
          ))}
        </AdminCard>
      )}
    </div>
  );
}