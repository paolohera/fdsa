import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminEmptyState,
} from "@/components/admin/admin-ui";
import { timeAgo } from "@/lib/time-ago";
import { toggleMessageRead, deleteMessage } from "./actions";

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
          {messages.map((msg) => {
            const replySubject = `Re: Your message to FDSA`;
            const replyBody = [
              `Hi ${msg.name},`,
              "",
              "",
              "",
              "---",
              `On ${new Date(msg.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}, you wrote:`,
              msg.message,
            ].join("\n");
            const replyHref = `mailto:${msg.email}?subject=${encodeURIComponent(
              replySubject
            )}&body=${encodeURIComponent(replyBody)}`;

            return (
              <div
                key={msg.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{msg.name}</p>
                    <AdminBadge tone={msg.read ? "slate" : "brass"}>
                      {msg.read ? "Read" : "New"}
                    </AdminBadge>
                  </div>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs text-brass hover:underline"
                  >
                    {msg.email}
                  </a>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-charcoal/80">
                    {msg.message}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                    {timeAgo(msg.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={replyHref}
                    className="flex items-center gap-1.5 border border-ink/15 bg-ink px-3 py-1.5 text-xs font-medium text-parchment transition hover:bg-ink/90"
                  >
                    <Reply size={14} />
                    Reply
                  </a>

                  <form action={toggleMessageRead}>
                    <input type="hidden" name="id" value={msg.id} />
                    <input type="hidden" name="read" value={(!msg.read).toString()} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-ink/5"
                    >
                      {msg.read ? <Mail size={14} /> : <MailOpen size={14} />}
                      {msg.read ? "Mark unread" : "Mark read"}
                    </button>
                  </form>

                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={msg.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </AdminCard>
      )}
    </div>
  );
}