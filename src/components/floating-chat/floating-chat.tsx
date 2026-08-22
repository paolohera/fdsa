"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { startConversation, sendVisitorMessage } from "@/lib/chat/actions";
import TurnstileWidget from "@/components/turnstile-widget";

type ChatMessage = {
  id: string;
  sender: "visitor" | "admin";
  body: string;
  created_at: string;
};

const VISITOR_ID_KEY = "fdsa_chat_visitor_id";
const CONVERSATION_KEY = "fdsa_chat_conversation_id";
const NAME_KEY = "fdsa_chat_visitor_name";

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Consecutive messages from the same sender within 5 minutes are grouped:
// only the last bubble in a run shows a timestamp, so the thread reads
// more like a conversation and less like a log.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

function shouldShowTimestamp(messages: ChatMessage[], i: number) {
  const next = messages[i + 1];
  if (!next) return true;
  if (next.sender !== messages[i].sender) return true;
  return new Date(next.created_at).getTime() - new Date(messages[i].created_at).getTime() > GROUP_WINDOW_MS;
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // drives the enter transition
  const [visitorId, setVisitorId] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisitorId(getOrCreateVisitorId());
    const savedConversation = localStorage.getItem(CONVERSATION_KEY);
    const savedName = localStorage.getItem(NAME_KEY);
    if (savedConversation) setConversationId(savedConversation);
    if (savedName) setVisitorName(savedName);
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    let active = true;

    supabase
      .from("chat_messages")
      .select("id, sender, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (active && data) setMessages(data as ChatMessage[]);
      });

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => [...prev, incoming]);
          if (incoming.sender === "admin") {
            setUnreadCount((c) => (open ? 0 : c + 1));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Lock background scroll while the full-screen mobile sheet is open, and
  // drive the panel's enter animation a frame after mount.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setUnreadCount(0);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => {
        document.body.style.overflow = "";
        cancelAnimationFrame(raf);
      };
    }
    setVisible(false);
  }, [open]);

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const turnstileToken = (formData.get("turnstileToken") as string) ?? "";

    const result = await startConversation(visitorId, nameInput, honeypot, turnstileToken);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    localStorage.setItem(CONVERSATION_KEY, result.conversationId!);
    localStorage.setItem(NAME_KEY, nameInput.trim());
    setVisitorName(nameInput.trim());
    setConversationId(result.conversationId!);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!conversationId || !draft.trim() || sending) return;

    setSending(true);
    setError(null);
    const text = draft;
    setDraft("");

    const result = await sendVisitorMessage(conversationId, visitorId, text, honeypot);

    if (!result.ok) {
      setError(result.error);
      if (result.error.toLowerCase().includes("too quickly")) {
        localStorage.removeItem(CONVERSATION_KEY);
        setConversationId(null);
      }
    }

    setSending(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-3 px-4 pb-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-0 sm:pb-0">
      {open && (
        <div
          className={`
            fixed inset-0 z-50 flex flex-col overflow-hidden bg-paper
            transition-all duration-200 ease-out
            sm:static sm:inset-auto sm:h-[28rem] sm:w-80 sm:rounded-2xl
            sm:border sm:border-ink/10 sm:shadow-2xl sm:origin-bottom-right
            ${visible ? "opacity-100 sm:scale-100" : "opacity-0 sm:scale-95 sm:translate-y-2"}
          `}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-ink px-4 py-3 sm:rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                <div className="h-full w-full overflow-hidden rounded-full bg-brass/20">
                  <Image src="/icons/android-chrome-192x192.png" alt="FDSA" fill sizes="32px" quality={100} className="object-contain" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-semibold leading-tight text-parchment"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Chat with FDSA
                </p>
                <p className="text-[11px] leading-tight text-parchment/50">Usually replies within a day</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-parchment/60 transition hover:bg-white/10 hover:text-parchment"
            >
              <X size={16} />
            </button>
          </div>

          {!conversationId ? (
            <form onSubmit={handleStart} className="flex flex-1 flex-col justify-center gap-3 px-6">
              <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-brass/15">
                <MessageCircle size={20} className="text-brass" />
              </div>
              <p className="text-center text-sm text-charcoal/70">
                What&apos;s your name? We&apos;ll use it to say hi.
              </p>
              <input
                type="text"
                required
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Full name"
                className="rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
              />
              {/* Honeypot — hidden from real users via CSS, bots fill every field they find */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <div className="flex justify-center">
                <TurnstileWidget />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                className="rounded-lg bg-brass py-2.5 text-sm font-semibold text-ink transition hover:bg-brass/90"
              >
                Start chat
              </button>
            </form>
          ) : (
            <>
              {/* Message list */}
              <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-3.5 py-3.5">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.04]">
                      <MessageCircle size={18} className="text-charcoal/30" />
                    </div>
                    <p className="max-w-[15rem] text-xs text-charcoal/40">
                      Say hello, {visitorName.split(" ")[0]} — an admin will reply here.
                    </p>
                  </div>
                )}
                {messages.map((m, i) => {
                  const showTime = shouldShowTimestamp(messages, i);
                  const prevSameSender = i > 0 && messages[i - 1].sender === m.sender && shouldShowTimestamp(messages, i - 1) === false;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === "visitor" ? "items-end" : "items-start"} ${
                        prevSameSender ? "mt-0.5" : "mt-2"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                          m.sender === "visitor"
                            ? "rounded-br-sm bg-brass text-ink"
                            : "rounded-bl-sm bg-ink/[0.06] text-ink"
                        }`}
                      >
                        {m.body}
                      </div>
                      {showTime && (
                        <span className="mt-0.5 px-1 text-[10px] text-charcoal/30">{formatTime(m.created_at)}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSend}
                className="shrink-0 border-t border-ink/10 bg-paper px-3 py-2.5 sm:rounded-b-2xl"
              >
                {error && <p className="mb-2 px-1 text-xs text-red-600">{error}</p>}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    maxLength={1000}
                    className="flex-1 rounded-full border border-ink/15 px-3.5 py-2 text-sm outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    aria-label="Send"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass text-ink transition hover:bg-brass/90 disabled:opacity-40"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className={`relative flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full bg-brass text-ink shadow-xl transition hover:bg-brass/90 hover:scale-105 ${
          open ? "hidden sm:flex" : "flex"
        }`}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-parchment">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}