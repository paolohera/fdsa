"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendAdminReply, banVisitorFromConversation, closeConversation } from "@/lib/chat/actions";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";

type ChatMessage = {
  id: string;
  sender: "visitor" | "admin";
  body: string;
  created_at: string;
};

export default function ChatThread({
  conversationId,
  visitorId,
  visitorName,
  initialMessages,
  initialStatus,
}: {
  conversationId: string;
  visitorId: string;
  visitorName: string;
  initialMessages: ChatMessage[];
  initialStatus: "open" | "closed";
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState(initialStatus);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`admin-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const text = draft;
    setDraft("");
    await sendAdminReply(conversationId, text);
    setSending(false);
  }

  async function handleBan() {
    if (!confirm(`Ban ${visitorName}? They won't be able to send messages here again.`)) return;
    await banVisitorFromConversation(conversationId, visitorId);
    setStatus("closed");
  }

  async function handleClose() {
    await closeConversation(conversationId);
    setStatus("closed");
  }

  return (
    <AdminCard className="flex h-[32rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink/10 p-4">
        <div>
          <p className="text-sm font-semibold text-ink">{visitorName}</p>
          <p className="text-xs text-charcoal/40">{status === "open" ? "Open" : "Closed"}</p>
        </div>
        <div className="flex gap-2">
          {status === "open" && (
            <AdminButton variant="secondary" onClick={handleClose} type="button">
              Close chat
            </AdminButton>
          )}
          <AdminButton variant="danger" onClick={handleBan} type="button">
            <Ban size={14} /> Ban
          </AdminButton>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                m.sender === "admin" ? "bg-ink text-parchment" : "bg-ink/5 text-ink"
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
      </div>

      {status === "open" ? (
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink/10 p-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply…"
            maxLength={1000}
            className="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brass"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brass text-ink transition hover:bg-brass/90 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="border-t border-ink/10 p-3 text-center text-xs text-charcoal/40">
          This conversation is closed.
        </p>
      )}
    </AdminCard>
  );
}