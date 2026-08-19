import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatThread from "./chat-thread";

export default async function LiveChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id, visitor_id, visitor_name, status")
    .eq("id", id)
    .single();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href="/admin/live-chat"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to conversations
      </Link>

      <ChatThread
        conversationId={conversation.id}
        visitorId={conversation.visitor_id}
        visitorName={conversation.visitor_name}
        initialMessages={messages ?? []}
        initialStatus={conversation.status}
      />
    </div>
  );
}