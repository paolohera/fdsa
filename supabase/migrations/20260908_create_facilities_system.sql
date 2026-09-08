-- Facilities system with gallery support (max 10 images per facility)

-- Main facilities table
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  cover_image text, -- references facility_images.id or can be a direct URL
  is_published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gallery images table (max 10 per facility)
create table if not exists public.facility_images (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  image_url text not null,
  storage_path text, -- Supabase storage path for deletion
  alt_text text,
  is_cover boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists facilities_published_idx on public.facilities (is_published, display_order);
create index if not exists facilities_slug_idx on public.facilities (slug);
create index if not exists facility_images_facility_idx on public.facility_images (facility_id, display_order);
create index if not exists facility_images_cover_idx on public.facility_images (facility_id, is_cover);

-- RLS Policies
alter table public.facilities enable row level security;
alter table public.facility_images enable row level security;

-- Public can read published facilities
create policy "Public can view published facilities"
  on public.facilities for select
  to anon, authenticated
  using (is_published = true);

-- Admins can manage facilities
create policy "Admins can manage facilities"
  on public.facilities for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
  );

-- Public can view images of published facilities
create policy "Public can view facility images"
  on public.facility_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.facilities
      where facilities.id = facility_images.facility_id
      and facilities.is_published = true
    )
  );

-- Admins can manage facility images
create policy "Admins can manage facility images"
  on public.facility_images for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
  );

-- Function to enforce max 10 images per facility
create or replace function public.enforce_facility_image_limit()
returns trigger
language plpgsql
as $$
begin
  -- Only enforce on INSERT and UPDATE
  if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
    if (NEW.is_cover) then
      -- Ensure only one cover per facility
      update public.facility_images
      set is_cover = false
      where facility_id = NEW.facility_id
      and id != NEW.id;
    end if;

    -- Check total image count
    if (select count(*) from public.facility_images where facility_id = NEW.facility_id) >= 10 then
      raise exception 'Maximum of 10 images per facility reached. Please delete an image before adding a new one.';
    end if;
  end if;

  return NEW;
end;
$$;

-- Trigger to enforce limits
drop trigger if exists trigger_facility_image_limit on public.facility_images;
create trigger trigger_facility_image_limit
  before insert or update on public.facility_images
  for each row execute function public.enforce_facility_image_limit();

-- Function to maintain single cover per facility
create or replace function public.maintain_single_cover()
returns trigger
language plpgsql
as $$
begin
  if NEW.is_cover then
    update public.facility_images
    set is_cover = false
    where facility_id = NEW.facility_id
    and id != NEW.id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_maintain_single_cover on public.facility_images;
create trigger trigger_maintain_single_cover
  before insert or update on public.facility_images
  for each row execute function public.maintain_single_cover();

-- Grant permissions
grant select on public.facilities to anon, authenticated;
grant select on public.facility_images to anon, authenticated;
grant insert, update, delete on public.facilities to authenticated;
grant insert, update, delete on public.facility_images to authenticated;

-- Updated timestamp trigger
create or replace function public.update_facilities_timestamp()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

drop trigger if exists trigger_update_facilities_timestamp on public.facilities;
create trigger trigger_update_facilities_timestamp
  before update on public.facilities
  for each row execute function public.update_facilities_timestamp();

-- Storage bucket for facility images (if not exists)
-- Note: Run this in Supabase Dashboard Storage section manually if needed
-- insert into storage.buckets (id, name, public) values ('facility-images', 'facility-images', true)
-- on conflict (id) do nothing;

-- Storage policies (run in Supabase SQL editor)
-- create policy "Public can view facility images" on storage.objects for select using (bucket_id = 'facility-images');
-- create policy "Admins can upload facility images" on storage.objects for insert to authenticated using (bucket_id = 'facility-images' and (select role from profiles where id = auth.uid()) in ('admin', 'super_admin'));
-- create policy "Admins can update facility images" on storage.objects for update to authenticated using (bucket_id = 'facility-images' and (select role from profiles where id = auth.uid()) in ('admin', 'super_admin'));
-- create policy "Admins can delete facility images" on storage.objects for delete to authenticated using (bucket_id = 'facility-images' and (select role from profiles where id = auth.uid()) in ('admin', 'super_admin'));