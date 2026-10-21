-- Pat's Postcard World: notes wall + contact form (and a privacy fix for postcards).
-- Additive only: creates new tables, a private helper schema and functions.
-- Does not drop, delete or loosen anything. Safe to re-run.

-- ---------- private helpers (not reachable through the public API) ----------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.settings (k text primary key, v text not null);
insert into private.settings (k, v)
  values ('hash_salt', encode(extensions.gen_random_bytes(32), 'hex'))
  on conflict (k) do nothing;

-- One-way, secretly salted hash of the visitor's connection, used only for rate limits.
create or replace function private.sender_hash() returns text
language plpgsql stable security definer set search_path = '' as $$
declare ip text; s text;
begin
  ip := trim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1));
  if ip = '' then return null; end if;
  select v into s from private.settings where k = 'hash_salt';
  return encode(extensions.digest(s || ip, 'sha256'), 'hex');
end $$;

-- Same word and link rules as the site's isRude() filter, enforced in the database.
create or replace function private.is_suspicious(t text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare raw text := lower(coalesce(t, '')); n text; words text; squashed text;
begin
  if raw ~ '(https?://|www\.|\.com\M|\.sg\M|\.net\M)' then return true; end if;
  n := translate(raw, '0134578@$!', 'oieastbasi');
  words := ' ' || trim(regexp_replace(n, '[^a-z]+', ' ', 'g')) || ' ';
  if words ~ ' (ass|dick|cock|cum|tits|slut|sluts|slutty|pussy|cunt|cunts|shit|shitty|bastard|wanker|twat|nigga|niggas|nigger|niggers|fag|fags|faggot|faggots|retard|retarded|rape|porn|nsfw|kys|ccb|knn|cb|tangina|gago|puta|ulol|tarantado|bwisit|pantek|sial|babi) ' then return true; end if;
  squashed := regexp_replace(regexp_replace(n, '[^a-z]', '', 'g'), '(.)\1+', '\1', 'g');
  if squashed ~ '(fuck|bitch|ashole|motherf|whore|dickhead|putangina|pakyu|pukimak|chebai|chibai|lanjiao|kilyourself)' then return true; end if;
  return false;
end $$;

revoke all on all functions in schema private from public, anon, authenticated;

-- ---------- notes: instant, but suspicious ones are held back ----------
create table if not exists public.notes (
  id          bigint generated always as identity primary key,
  note        text not null check (char_length(note) between 1 and 280),
  name        text check (name is null or char_length(name) between 1 and 24),
  color       smallint not null default 0 check (color between 0 and 4),
  flagged     boolean not null default false,
  flag_reason text,
  created_at  timestamptz not null default now(),
  sender_hash text
);
alter table public.notes enable row level security;

revoke all on public.notes from anon, authenticated;
grant insert (note, name, color) on public.notes to anon;
grant select (id, created_at, note, name, color) on public.notes to anon;

drop policy if exists "anyone can leave a note" on public.notes;
drop policy if exists "anyone can read unflagged notes" on public.notes;
create policy "anyone can leave a note" on public.notes for insert to anon with check (true);  -- visitors cannot write the flagged column; the trigger sets it
create policy "anyone can read unflagged notes" on public.notes for select to anon using (flagged = false);

create or replace function public.notes_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare h text := private.sender_hash();
begin
  if (select count(*) from public.notes where flagged) >= 200 then
    raise exception 'The wall is paused for a moment. Please try again later.' using errcode = 'P0001';
  end if;
  if h is not null and (select count(*) from public.notes where sender_hash = h and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many notes from this connection. Please try again later.' using errcode = 'P0001';
  end if;
  new.sender_hash := h;
  new.flagged := false; new.flag_reason := null;
  if private.is_suspicious(new.note) or private.is_suspicious(new.name) then
    new.flagged := true; new.flag_reason := 'word or link filter';
  end if;
  return new;
end $$;
revoke all on function public.notes_guard() from public, anon, authenticated;
drop trigger if exists notes_guard on public.notes;
create trigger notes_guard before insert on public.notes for each row execute function public.notes_guard();

-- ---------- contacts: write-only for visitors, never readable ----------
create table if not exists public.contacts (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 1 and 60),
  email       text check (email is null or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')),
  flagged     boolean not null default false,
  created_at  timestamptz not null default now(),
  sender_hash text
);
alter table public.contacts enable row level security;

revoke all on public.contacts from anon, authenticated;
grant insert (name, email) on public.contacts to anon;

drop policy if exists "anyone can say hello" on public.contacts;
create policy "anyone can say hello" on public.contacts for insert to anon with check (true);  -- flagged is set only by the trigger

create or replace function public.contacts_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare h text := private.sender_hash();
begin
  if (select count(*) from public.contacts where created_at > now() - interval '1 day') >= 300 then
    raise exception 'Messages are paused for a moment. Please try again later.' using errcode = 'P0001';
  end if;
  if h is not null and (select count(*) from public.contacts where sender_hash = h and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many messages from this connection. Please try again later.' using errcode = 'P0001';
  end if;
  new.sender_hash := h;
  new.flagged := private.is_suspicious(new.name);
  return new;
end $$;
revoke all on function public.contacts_guard() from public, anon, authenticated;
drop trigger if exists contacts_guard on public.contacts;
create trigger contacts_guard before insert on public.contacts for each row execute function public.contacts_guard();

-- ---------- postcards: swap the public-salt md5 for the private salted hash (audit #23) ----------
create or replace function public.postcards_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare h text := private.sender_hash();
begin
  if (select count(*) from public.postcards where approved = false) >= 300 then
    raise exception 'Postcards are paused for a moment. Please try again later.' using errcode = 'P0001';
  end if;
  if h is not null and (select count(*) from public.postcards where sender_hash = h and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many postcards from this connection. Please try again later.' using errcode = 'P0001';
  end if;
  new.sender_hash := h;
  return new;
end $$;
revoke all on function public.postcards_guard() from public, anon, authenticated;
drop trigger if exists postcards_guard on public.postcards;
create trigger postcards_guard before insert on public.postcards for each row execute function public.postcards_guard();
