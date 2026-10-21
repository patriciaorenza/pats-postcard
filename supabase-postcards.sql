-- Pat's Postcard World: postcards table (hardened).
-- Run once in Supabase > SQL Editor > New query > paste all > Run, then run supabase-notes-contacts.sql.
-- Postcards stay hidden until you tick "approved" on a row in Table Editor.

create table if not exists public.postcards (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 1 and 40),
  country     text not null check (char_length(country) between 2 and 60),
  message     text not null check (char_length(message) between 3 and 240
                                   and message !~* '(https?:|www\.)'),
  approved    boolean not null default false,
  created_at  timestamptz not null default now(),
  sender_hash text            -- one-way hash of the sender's connection, used only to throttle spam
);

alter table public.postcards enable row level security;

-- Visitors (the "anon" role) get the bare minimum:
--   * insert only name/country/message (they can never set approved, created_at or sender_hash)
--   * read only rows you approved, and never sender_hash
revoke all on public.postcards from anon, authenticated;
grant insert (name, country, message) on public.postcards to anon;
grant select (name, country, message, approved, created_at) on public.postcards to anon;

drop policy if exists "anyone can send a postcard" on public.postcards;
drop policy if exists "anyone can read approved postcards" on public.postcards;
create policy "anyone can send a postcard" on public.postcards
  for insert to anon with check (approved = false);
create policy "anyone can read approved postcards" on public.postcards
  for select to anon using (approved = true);

-- Spam guard (max 5 postcards per connection per hour, pause at 300 waiting for review)
-- now lives in supabase-notes-contacts.sql, which uses a secret salted hash instead of md5.
-- Run that file after this one. Do not re-add the old md5 guard here.
