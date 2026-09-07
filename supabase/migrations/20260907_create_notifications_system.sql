-- Centralized notifications table for admin notification bell
-- Supports: contact messages, live chat messages, enrollment applications

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('message', 'live_chat', 'enrollment')),
  title text not null,
  message text not null,
  link text not null,
  reference_id uuid not null,
  reference_type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- Index for efficient queries
create index if not exists notifications_admin_idx 
  on public.notifications (is_read, created_at desc);

create index if not exists notifications_ref_idx 
  on public.notifications (reference_type, reference_id);

-- RLS: Only authenticated admins can access notifications
alter table public.notifications enable row level security;

create policy "Admins can view all notifications"
  on public.notifications for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'super_admin')
    )
  );

create policy "Admins can update notifications"
  on public.notifications for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'super_admin')
    )
  );

-- Function to create notification for new contact message
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notifications (type, title, message, link, reference_id, reference_type)
  values (
    'message',
    'New Message',
    NEW.name || ' sent you a new message',
    '/admin/messages',
    NEW.id,
    'contact_message'
  );
  return NEW;
end;
$$;

-- Function to create notification for new live chat visitor message
create or replace function public.notify_new_chat_message()
returns trigger
language plpgsql
security definer
as $$
declare
  v_conversation record;
  v_visitor_name text;
begin
  -- Only notify for visitor messages, not admin replies
  if NEW.sender <> 'visitor' then
    return NEW;
  end if;

  -- Get conversation info for visitor name
  select c.visitor_name, c.id into v_conversation
  from public.chat_conversations c
  where c.id = NEW.conversation_id;

  v_visitor_name := coalesce(v_conversation.visitor_name, 'Visitor');

  insert into public.notifications (type, title, message, link, reference_id, reference_type)
  values (
    'live_chat',
    'New Live Chat Message',
    v_visitor_name || ' sent a new message',
    '/admin/live-chat/' || NEW.conversation_id,
    NEW.conversation_id,
    'chat_conversation'
  );
  return NEW;
end;
$$;

-- Function to create notification for new enrollment
create or replace function public.notify_new_enrollment()
returns trigger
language plpgsql
security definer
as $$
declare
  v_name text;
begin
  -- Extract name from data JSON
  v_name := coalesce(
    NEW.data->>'full_name',
    NEW.data->>'name',
    'New applicant'
  );

  insert into public.notifications (type, title, message, link, reference_id, reference_type)
  values (
    'enrollment',
    'New Enrollment Application',
    v_name || ' submitted an enrollment application',
    '/admin/enrollment/' || NEW.id,
    NEW.id,
    'enrollment_submission'
  );
  return NEW;
end;
$$;

-- Triggers
drop trigger if exists trigger_notify_new_message on public.contact_messages;
create trigger trigger_notify_new_message
  after insert on public.contact_messages
  for each row execute function public.notify_new_message();

drop trigger if exists trigger_notify_new_chat_message on public.chat_messages;
create trigger trigger_notify_new_chat_message
  after insert on public.chat_messages
  for each row execute function public.notify_new_chat_message();

drop trigger if exists trigger_notify_new_enrollment on public.enrollment_submissions;
create trigger trigger_notify_new_enrollment
  after insert on public.enrollment_submissions
  for each row execute function public.notify_new_enrollment();

-- Grant permissions
grant select, update on public.notifications to authenticated;
grant usage on schema public to authenticated;

-- Add notifications table to Supabase Realtime publication for real-time updates
alter publication supabase_realtime add table public.notifications;