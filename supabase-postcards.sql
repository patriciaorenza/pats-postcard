-- Pat's Postcard World: postcards table (hardened).
-- Run once in Supabase > SQL Editor > New query > paste all > Run.
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

-- Spam guard: max 5 postcards per connection per hour, and stop accepting
-- new ones if 300 are already waiting for your review.
create or replace function public.postcards_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare ip text; h text;
begin
  if (select count(*) from public.postcards where approved = false) >= 300 then
    raise exception 'Postcards are paused for a moment. Please try again later.' using errcode = 'P0001';
  end if;
  ip := split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1);
  if trim(ip) <> '' then
    h := md5('pats-postcards:' || trim(ip));
    if (select count(*) from public.postcards where sender_hash = h and created_at > now() - interval '1 hour') >= 5 then
      raise exception 'Too many postcards from this connection. Please try again later.' using errcode = 'P0001';
    end if;
    new.sender_hash := h;
  end if;
  return new;
end $$;
revoke all on function public.postcards_guard() from public, anon, authenticated;

drop trigger if exists postcards_guard on public.postcards;
create trigger postcards_guard before insert on public.postcards
  for each row execute function public.postcards_guard();
