"use client";

import { useTransition } from "react";
import { Mail, MailOpen, Reply, Trash2, Loader2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-ui";
import { toggleMessageRead, deleteMessage } from "./actions";
import { useAdminToast } from "@/components/admin/admin-toast";
import { timeAgo } from "@/lib/time-ago";

type MessageRowProps = {
  msg: {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
    read: boolean;
  };
};

export default function MessageRow({ msg }: MessageRowProps) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

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

  const handleToggleRead = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", msg.id);
        formData.append("read", (!msg.read).toString());
        await toggleMessageRead(formData);
        showToast(msg.read ? "Message marked unread" : "Message marked read", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to update message", "error");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", msg.id);
        await deleteMessage(formData);
        showToast("Message deleted", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to delete message", "error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
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

        <button
          type="button"
          onClick={handleToggleRead}
          disabled={pending}
          className="flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-ink/5 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {msg.read ? <Mail size={14} /> : <MailOpen size={14} />}
          {msg.read ? "Mark unread" : "Mark read"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}