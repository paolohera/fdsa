-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Sets up: a profiles table (extends auth.users with a role), a news_posts
-- table as the first CMS content type, and RLS policies for both.

-- 1. PROFILES ---------------------------------------------------------------
-- Extends Supabase's built-in auth.users with an app-specific role.
-- A row is created automatically for every new signup via the trigger below.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone logged in can read their own profile (needed to check their role).
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. NEWS POSTS ---------------------------------------------------------------
-- First real content type. More tables (programs, events, faculty) can
-- follow this same shape later.

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  published boolean not null default false,
  author_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news_posts enable row level security;

-- Public visitors can read only published posts.
create policy "news_posts: public reads published"
  on public.news_posts for select
  using (published = true);

-- Admins and editors can read every post, published or not.
create policy "news_posts: staff read all"
  on public.news_posts for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- Admins and editors can insert/update/delete.
create policy "news_posts: staff write"
  on public.news_posts for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at
  before update on public.news_posts
  for each row execute function public.set_updated_at();

-- 3. FIRST ADMIN --------------------------------------------------------------
-- After you sign up your first user through the app (or Supabase Dashboard ->
-- Authentication -> Users -> Add user), promote them to admin by running:
--
-- update public.profiles set role = 'admin' where email = 'you@university.edu';
