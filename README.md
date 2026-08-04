# University Site — Admin/DB Foundation

Next.js 16 (App Router) + Supabase. This first slice proves out the
connection and pattern: auth, role-based access, and one CRUD content type
(`news_posts`). Everything else (programs, events, faculty, public pages)
follows the same shape.

## What's here

- `src/lib/supabase/` — three Supabase clients: `client.ts` (browser),
  `server.ts` (Server Components/Actions), `middleware.ts` (session refresh
  + route protection helper used by `src/proxy.ts`)
- `src/proxy.ts` — Next.js 16's request middleware. Keeps the auth session
  fresh and redirects unauthenticated visitors away from `/admin`.
- `src/app/admin/` — the admin panel:
  - `/admin/login` — email/password sign-in
  - `/admin` — dashboard (currently just a live DB connection check)
  - `/admin/news` — list, create, edit, delete news posts
- `supabase/schema.sql` — run this once in the Supabase SQL Editor. Creates
  `profiles` (role-based access) and `news_posts`, with row-level security
  so public visitors only ever see published posts, and only `admin`/`editor`
  roles can write.

## Setup

1. **Create a Supabase project** at supabase.com if you don't have one yet.

2. **Run the schema.** Supabase Dashboard -> SQL Editor -> paste the contents
   of `supabase/schema.sql` -> Run.

3. **Copy env vars.**
   ```
   cp .env.local.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   from Supabase Dashboard -> Project Settings -> API.

4. **Install and run.**
   ```
   npm install
   npm run dev
   ```

5. **Create your first admin user.** Either:
   - Supabase Dashboard -> Authentication -> Users -> Add user, or
   - Sign up flow (not built yet — for now, add users via the dashboard)

   Then promote them to admin by running in the SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@university.edu';
   ```

6. Visit `/admin/login` and sign in.

## Roles

`profiles.role` is one of `admin`, `editor`, `viewer` (default). Only
`admin`/`editor` can reach the admin panel and write `news_posts`. Extend
this table's `role` check constraint if you need finer-grained roles later
(e.g. a `faculty` role that can only edit their own bio, once that table
exists).

## Not built yet (by design — this was scoped as DB connection + admin first)

- Public-facing pages (home, admissions, academics, etc.)
- Additional content types (programs, events, faculty) — copy the
  `news_posts` pattern (table + RLS policy + admin CRUD pages)
- Public signup / password reset flows
- Image/file uploads via Supabase Storage
