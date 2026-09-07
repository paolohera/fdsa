-- Add atomic increment function for chat_conversations.unread_count
-- This avoids race conditions when multiple visitor messages arrive concurrently

create or replace function increment_unread_count(conversation_id uuid)
returns void
language sql
as $$
  update chat_conversations
  set unread_count = unread_count + 1,
      last_message_at = now()
  where id = conversation_id;
$$;

-- Grant execute permission to authenticated and anon roles
grant execute on function increment_unread_count(uuid) to authenticated, anon;